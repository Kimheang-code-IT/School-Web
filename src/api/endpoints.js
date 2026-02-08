/**
 * API endpoint paths and expected response shapes.
 * Backend should implement these endpoints; frontend falls back to static JSON on failure.
 */

export const ENDPOINTS = {
  COURSES: '/courses',
  PRODUCTS: '/products',
  CATEGORIES_COURSES: '/categories/courses',
  CATEGORIES_PRODUCTS: '/categories/products',
  CONTACT: '/contact',
  PARTNERS: '/partners',
  HERO_SLIDES: '/hero-slides',
  DELIVERY_MODES: '/delivery-modes',
  NEWS: '/news',
  LANGUAGES: '/languages',
  TRANSLATIONS: '/translations',
  FORMS_REGISTRATION: '/forms/registration',
  ENROLLMENTS: '/enrollments',
};

/**
 * Expected response shapes (for backend alignment):
 *
 * GET /courses          -> Array of { id, slug, name, description, category_slug, level, mode, price, final_price, ... }
 * GET /products         -> Array of { id, slug, name, title, price, image_url, category_slug, ... }
 * GET /categories/courses  -> Array of { id, slug, name, is_active }
 * GET /categories/products -> Array of { id, slug, name }
 * GET /contact          -> Object { email_primary, phone_primary, address_line1, city, country, facebook_link, ... }
 * GET /partners         -> Array of { id, name, image_url, link_url, ... }
 * GET /hero-slides      -> Array of { id, title, subtitle, image_url, order, ... }
 * GET /delivery-modes   -> Array of { id, title, description, mode, image_url, link_url, course_slug, ... }
 * GET /news             -> Array of { id, title, excerpt, date, image_url, ... }
 * GET /languages        -> Array of { code, name, is_active, is_default }
 * GET /translations?lang=en  -> Object (flat or nested) of translation key -> string
 * GET /forms/registration   -> Array of { key, label_en, label_km, placeholder_en, placeholder_km, type, required, options }
 * POST /enrollments      -> Body: enrollment object; Response: { success, id? }
 */
