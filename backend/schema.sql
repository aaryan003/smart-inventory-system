-- Run this using any SQLite GUI or C++ setup method

CREATE TABLE products (
                          id TEXT PRIMARY KEY,
                          name TEXT NOT NULL,
                          sku TEXT UNIQUE NOT NULL,
                          barcode TEXT UNIQUE,
                          category TEXT,
                          price REAL,
                          stock INTEGER DEFAULT 0,
                          threshold INTEGER DEFAULT 0,
                          description TEXT,
                          status TEXT CHECK(status IN ('in-stock', 'low-stock', 'out-of-stock')),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_settings (
                                    product_id TEXT,
                                    min_stock INTEGER DEFAULT 0,
                                    max_stock INTEGER DEFAULT 1000,
                                    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE alerts (
                        id TEXT PRIMARY KEY,
                        type TEXT CHECK(type IN ('low-stock', 'out-of-stock', 'overstock')),
                        message TEXT,
                        product_id TEXT,
                        severity TEXT CHECK(severity IN ('high', 'medium', 'low')),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id)
);
