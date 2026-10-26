
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "smartcart-products";

const demoProducts = [
  {
    id: "demo-1",
    name: "Bluetooth Headphones",
    category: "Electronics",
    store: "Amazon",
    price: "899",
    oldPrice: "1499",
    imageUrl: "",
    affiliateLink: "",
  },
  {
    id: "demo-2",
    name: "Smart Watch",
    category: "Electronics",
    store: "Flipkart",
    price: "1299",
    oldPrice: "2499",
    imageUrl: "",
    affiliateLink: "",
  },
  {
    id: "demo-3",
    name: "Everyday Backpack",
    category: "Fashion",
    store: "Amazon",
    price: "699",
    oldPrice: "1199",
    imageUrl: "",
    affiliateLink: "",
  },
];

const emptyForm = {
  name: "",
  category: "Electronics",
  store: "Amazon",
  price: "",
  oldPrice: "",
  imageUrl: "",
  affiliateLink: "",
};

function readProducts() {
  try {
    const keys = [
      STORAGE_KEY,
      "smartcartProducts",
      "smartcart_products",
      "products",
    ];

    for (const key of keys) {
      const saved = localStorage.getItem(key);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed.map((product, index) => ({
            ...product,
            id: product.id ?? `product-${index}-${Date.now()}`,
            name: product.name ?? product.title ?? "",
            category: product.category ?? "Other",
            store: product.store ?? product.merchant ?? "Other",
            price:
              product.price ??
              product.sellingPrice ??
              product.selling_price ??
              "",
            oldPrice:
              product.oldPrice ??
              product.originalPrice ??
              product.old_price ??
              "",
            imageUrl:
              product.imageUrl ??
              product.image ??
              product.imageURL ??
              "",
            affiliateLink:
              product.affiliateLink ??
              product.retailerLink ??
              product.productUrl ??
              product.link ??
              "",
          }));
        }
      }
    }
  } catch (error) {
    console.error("Could not load saved products:", error);
  }

  return demoProducts;
}

function formatPrice(price) {
  if (price === "" || price === null || price === undefined) {
    return "Price unavailable";
  }

  const number = Number(price);

  if (!Number.isFinite(number)) {
    return String(price);
  }

  return number.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function App() {
  const [products, setProducts] = useState(readProducts);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (storageError) {
      console.error("Could not save products:", storageError);
      setError("Products could not be saved in browser storage.");
    }
  }, [products]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const matchesSearch =
        !query ||
        [product.name, product.category, product.store]
          .some((value) =>
            String(value ?? "").toLowerCase().includes(query)
          );

      return matchesCategory && matchesSearch;
    });
  }, [products, search, activeCategory]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setMessage("");
    setFormOpen(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);
    setForm({
      name: product.name ?? "",
      category: product.category ?? "Electronics",
      store: product.store ?? "Amazon",
      price: String(product.price ?? ""),
      oldPrice: String(product.oldPrice ?? ""),
      imageUrl: product.imageUrl ?? "",
      affiliateLink: product.affiliateLink ?? "",
    });
    setError("");
    setMessage("");
    setFormOpen(true);

    document
      .getElementById("product-management")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function saveProduct(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Please enter the product name.");
      return;
    }

    if (form.price.trim() === "" || !Number.isFinite(Number(form.price)) ||
        Number(form.price) < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      form.oldPrice.trim() !== "" &&
      (!Number.isFinite(Number(form.oldPrice)) ||
        Number(form.oldPrice) < 0)
    ) {
      setError("Please enter a valid original price.");
      return;
    }

    const productData = {
      id: editingId ?? `product-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      store: form.store,
      price: form.price,
      oldPrice: form.oldPrice,
      imageUrl: form.imageUrl.trim(),
      affiliateLink: form.affiliateLink.trim(),
    };

    if (editingId !== null) {
      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingId ? productData : product
        )
      );
      setMessage("Product updated successfully!");
    } else {
      setProducts((previous) => [productData, ...previous]);
      setMessage("Product added successfully!");
    }

    setForm({ ...emptyForm });
    setEditingId(null);
    setFormOpen(false);
  }

  function deleteProduct(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setProducts((previous) =>
      previous.filter((product) => product.id !== id)
    );

    setMessage("Product deleted successfully!");
    setError("");
  }

  function scrollToProducts() {
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="shop">
      <div className="topbar">
        Discover great products and compare shopping deals.
      </div>

      <header className="header">
        <a href="#" className="brand" aria-label="SmartCart home">
          <span className="brand-icon">S</span>
          <span>SmartCart</span>
        </a>

        <label className="search-box">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label="Search products"
          />
        </label>

        <a className="header-link" href="#products">
          Explore Deals <span>→</span>
        </a>
      </header>

      <main>
        <section className="hero-banner">
          <div className="hero-content">
            <span className="eyebrow">
              SMART SHOPPING STARTS HERE
            </span>

            <h1>
              Great finds.
              <br />
              Better choices.
            </h1>

            <p>
              Discover popular products, compare prices and
              shop from trusted online stores.
            </p>

            <button
              className="primary-button"
              onClick={scrollToProducts}
            >
              Explore Products <span>→</span>
            </button>

            <div className="trust-note">
              ✓ Easy discovery &nbsp; ✓ Trusted stores
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-circle" />
            <div className="shopping-bag">🛍️</div>
            <div className="floating-card card-one">
              ✨ Great Deals
            </div>
            <div className="floating-card card-two">
              🛒 Smart Shopping
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SHOP BY CATEGORY</span>
              <h2>Explore Categories</h2>
            </div>
          </div>

          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-chip ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HANDPICKED FOR YOU</span>
              <h2>Popular Products</h2>
              <p className="section-subtitle">
                Find products and compare shopping deals.
              </p>
            </div>

            <span className="product-count">
              {filteredProducts.length} Products
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const affiliateUrl =
                  typeof product.affiliateLink === "string"
                    ? product.affiliateLink.trim()
                    : "";

                const hasValidLink = /^https?:\/\//i.test(
                  affiliateUrl
                );

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-image">
                      {product.imageUrl ? (
                        <img
                          className="real-product-image"
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="product-emoji">
                          🛍️
                        </span>
                      )}

                      {product.oldPrice !== "" &&
                        Number(product.oldPrice) >
                          Number(product.price) && (
                          <span className="deal-tag">
                            {Math.round(
                              ((Number(product.oldPrice) -
                                Number(product.price)) /
                                Number(product.oldPrice)) *
                                100
                            )}
                            % OFF
                          </span>
                        )}
                    </div>

                    <div className="product-info">
                      <span className="product-category">
                        {product.category || "General"}
                      </span>

                      <h3>{product.name}</h3>

                      <div className="price-row">
                        <strong>
                          {formatPrice(product.price)}
                        </strong>

                        {product.oldPrice !== "" &&
                          Number(product.oldPrice) >
                            Number(product.price) && (
                            <del>
                              {formatPrice(product.oldPrice)}
                            </del>
                          )}
                      </div>

                      <div className="store-row">
                        <span>Available at</span>
                        <strong>{product.store || "Other"}</strong>
                      </div>

                      {hasValidLink ? (
                        <a
                          className="store-button"
                          href={affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                        >
                          Buy Now <span>↗</span>
                        </a>
                      ) : (
                        <button
                          className="store-button disabled-store"
                          disabled
                          title="Add a retailer link to enable shopping"
                        >
                          Link coming soon
                        </button>
                      )}

                      <div className="product-admin-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span>🔎</span>
              <h3>No products found</h3>
              <p>
                Try another search or add a new product below.
              </p>
            </div>
          )}
        </section>

        <section className="affiliate-note">
          <div className="affiliate-icon">ℹ</div>
          <div>
            <h3>Shopping made simple</h3>
            <p>
              SmartCart helps you discover products from
              shopping stores. Prices and availability may
              change on the retailer's website. Some links may
              earn us a commission when affiliate links are used.
            </p>
          </div>
        </section>

        <section
          className="admin-section"
          id="product-management"
        >
          <div>
            <span className="eyebrow">STORE MANAGEMENT</span>
            <h2>Manage Products</h2>
            <p>
              Add, edit and remove products from your storefront.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Product
          </button>
        </section>

        {message && (
          <p className="admin-message" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {formOpen && (
          <section className="product-form-panel">
            <div className="form-heading">
              <div>
                <span className="eyebrow">
                  PRODUCT DETAILS
                </span>
                <h2>
                  {editingId !== null
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                aria-label="Close form"
                onClick={() => {
                  setFormOpen(false);
                  setError("");
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <label>
                Product Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="e.g. Bluetooth Headphones"
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  Category
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                  >
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home</option>
                    <option>Beauty</option>
                    <option>Sports</option>
                    <option>Accessories</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Retailer
                  <select
                    name="store"
                    value={form.store}
                    onChange={updateField}
                  >
                    <option>Amazon</option>
                    <option>Flipkart</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Selling Price (₹) *
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={updateField}
                    min="0"
                    step="0.01"
                    placeholder="899"
                    required
                  />
                </label>

                <label>
                  Original Price (₹)
                  <input
                    type="number"
                    name="oldPrice"
                    value={form.oldPrice}
                    onChange={updateField}
                    min="0"
                    step="0.01"
                    placeholder="1499"
                  />
                </label>
              </div>

              <label>
                Product Image URL
                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={updateField}
                  placeholder="https://example.com/image.jpg"
                />
              </label>

              <label>
                Retailer / Affiliate Link (optional)
                <input
                  type="url"
                  name="affiliateLink"
                  value={form.affiliateLink}
                  onChange={updateField}
                  placeholder="https://..."
                />
              </label>

              <p className="form-hint">
                Affiliate link abhi blank chhod sakte hain.
                Valid retailer link add hone par Buy Now enable
                hoga.
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setFormOpen(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingId !== null
                    ? "Save Changes"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <footer className="footer">
        <a href="#" className="brand footer-brand">
          <span className="brand-icon">S</span>
          <span>SmartCart</span>
        </a>

        <p>
          Discover great products. Shop smarter.
        </p>

        <span>© {new Date().getFullYear()} SmartCart</span>
      </footer>
    </div>
  );
}

export default App;
