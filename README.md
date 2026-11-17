# SHYENIX website

`index.html` is the SHYENIX storefront. It reads published products from Product Studio, including photos, descriptions, size variants and prices.

- Product admin: https://shyenix-product-studio.dustymural.chatgpt.site/admin
- Connected hosted storefront: https://shyenix-product-studio.dustymural.chatgpt.site/shop

## Update products

Sign into Product Studio with the store owner's ChatGPT account. Add or edit the product, set its status to Active, and choose Save & publish. The website loads the current catalog when opened or refreshed. Drafts stay private.

## Edit the design

Edit `index.html` to change the layout, text, colors, sections or buttons. Keep the catalog origin, product loading and image URL code connected to Product Studio. No private admin credentials are embedded in the HTML.

## GitHub Pages

Enable Pages in repository Settings → Pages, choose Deploy from a branch, then `main` and `/ (root)`. A custom domain must be configured separately if one is owned.

Orders continue through WhatsApp. Update stock manually after confirmed orders.
