"""Seeds the two demo accounts and the 54 grocery products.

    python manage.py seed_products
    python manage.py seed_products --with-orders

Safe to run twice: it clears the seeded rows first, then writes them fresh.
"""

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from orders.models import Address, Order, OrderItem
from products.models import Product

User = get_user_model()

VENDOR_USERNAME = 'Priya'
CUSTOMER_USERNAME = 'Arjun'
DEMO_PASSWORD = 'secret123'

# Household Care is deliberately absent: a student who clicks it sees nothing,
# and that is the data talking, not a broken filter.
DEAL_IDS = {9, 11, 18, 20, 42, 50}
OUT_OF_STOCK_IDS = {5, 23, 33, 35}

FV = 'Fruits & Vegetables'
DB = 'Dairy & Bakery'
SP = 'Snacks & Packaged Food'
BV = 'Beverages'

# id, title, brand, unit, category, price, mrp, rating, total_reviews
PRODUCTS = [
    (1, 'Bananas', 'Fresh Harvest', '1 dozen', FV, 59, 69, 4.2, 512),
    (2, 'Red Apples', 'Himalayan Orchards', '1 kg', FV, 189, 229, 4.4, 730),
    (3, 'Brown Bread', 'Britannia', '400 g', DB, 45, 50, 4.1, 480),
    (4, 'Potato Chips Classic Salted', "Lay's", '90 g', SP, 30, 35, 4.3, 604),
    (5, 'Orange Juice', 'Real', '1 L', BV, 115, 130, 4.0, 310),
    (6, 'Onions', 'Farm Fresh', '1 kg', FV, 42, 48, 3.9, 402),
    (7, 'Curd', 'Amul', '400 g', DB, 38, 42, 4.5, 655),
    (8, 'Tomatoes', 'Farm Fresh', '1 kg', FV, 38, 45, 4.2, 588),
    (9, 'Toned Milk', 'Amul', '1 L', DB, 54, 62, 4.5, 618),
    (10, 'Green Tea Bags', 'Lipton', '25 pcs', BV, 199, 245, 4.3, 208),
    (11, 'Baby Spinach', 'Fresh Harvest', '250 g', FV, 35, 45, 4.4, 288),
    (12, 'Cheese Slices', 'Amul', '200 g', DB, 125, 140, 4.4, 540),
    (13, 'Salted Butter', 'Amul', '500 g', DB, 265, 285, 4.6, 720),
    (14, 'Masala Namkeen Mixture', "Haldiram's", '400 g', SP, 95, 110, 4.1, 275),
    (15, 'Mango Drink', 'Frooti', '1.2 L', BV, 85, 99, 4.2, 611),
    (16, 'Cucumber', 'Farm Fresh', '500 g', FV, 25, 30, 4.0, 322),
    (17, 'Whole Wheat Atta', 'Aashirvaad', '5 kg', SP, 285, 320, 4.6, 705),
    (18, 'Roasted Almonds', 'Happilo', '200 g', SP, 349, 425, 4.5, 598),
    (19, 'Paneer', 'Amul', '200 g', DB, 89, 99, 4.2, 240),
    (20, 'Cola Soft Drink', 'Coca-Cola', '750 ml', BV, 40, 45, 4.1, 533),
    (21, 'Carrots', 'Fresh Harvest', '500 g', FV, 32, 40, 4.5, 420),
    (22, 'Multigrain Bread', 'Britannia', '400 g', DB, 55, 60, 4.4, 512),
    (23, 'Dark Chocolate', 'Amul', '150 g', SP, 175, 199, 4.3, 189),
    (24, 'Tender Coconut Water', 'Cocojal', '200 ml', BV, 45, 55, 4.4, 245),
    (25, 'Cauliflower', 'Farm Fresh', '1 pc', FV, 39, 45, 4.3, 388),
    (26, 'Fresh Cream', 'Amul', '250 ml', DB, 78, 85, 4.7, 812),
    (27, 'Instant Noodles', 'Maggi', '560 g', SP, 96, 105, 4.8, 690),
    (28, 'Buttermilk', 'Amul', '1 L', BV, 45, 50, 4.2, 344),
    (29, 'Green Capsicum', 'Fresh Harvest', '500 g', FV, 48, 58, 4.4, 466),
    (30, 'Eggs', 'Farm Fresh', '6 pcs', DB, 48, 55, 4.6, 733),
    (31, 'Basmati Rice', 'India Gate', '5 kg', SP, 649, 799, 4.9, 860),
    (32, 'Sparkling Water', 'Bisleri', '750 ml', BV, 35, 40, 4.0, 190),
    (33, 'Bottle Gourd', 'Farm Fresh', '1 kg', FV, 36, 42, 3.8, 298),
    (34, 'Mozzarella Cheese', 'Go', '200 g', DB, 199, 225, 4.4, 480),
    (35, 'Salted Peanuts', "Haldiram's", '200 g', SP, 55, 65, 3.9, 120),
    (36, 'Apple Juice', 'Real', '1 L', BV, 115, 125, 4.3, 388),
    (37, 'Lemons', 'Fresh Harvest', '500 g', FV, 45, 55, 4.1, 260),
    (38, 'Greek Yogurt', 'Epigamia', '400 g', DB, 145, 160, 4.7, 640),
    (39, 'Cashew Nuts', 'Happilo', '500 g', SP, 749, 899, 4.6, 455),
    (40, 'Iced Tea Lemon', 'Lipton', '1 L', BV, 99, 115, 4.1, 520),
    (41, 'Green Peas', 'Fresh Harvest', '500 g', FV, 52, 60, 4.0, 260),
    (42, 'Alphonso Mangoes', 'Himalayan Orchards', '1 kg', FV, 449, 599, 4.5, 574),
    (43, 'Croissant', 'Britannia', '4 pcs', DB, 99, 110, 4.2, 312),
    (44, 'Soan Papdi', "Haldiram's", '500 g', SP, 145, 165, 4.2, 430),
    (45, 'Cranberry Juice', 'Real', '1 L', BV, 145, 165, 4.1, 340),
    (46, 'Ginger', 'Farm Fresh', '250 g', FV, 38, 45, 4.5, 410),
    (47, 'Mineral Water', 'Bisleri', '2 L', BV, 30, 35, 3.8, 95),
    (48, 'Rusk Toast', 'Britannia', '300 g', DB, 45, 52, 4.3, 402),
    (49, 'Oats', 'Quaker', '1 kg', SP, 229, 265, 4.4, 618),
    (50, 'Fresh Malai Paneer', 'Amul', '500 g', DB, 199, 245, 4.2, 305),
    (51, 'Sweet Corn', 'Fresh Harvest', '500 g', FV, 49, 59, 3.9, 210),
    (52, 'Tomato Ketchup', 'Kissan', '950 g', SP, 135, 155, 4.0, 356),
    (53, 'Masala Chaas', 'Amul', '500 ml', BV, 25, 30, 4.3, 288),
    (54, 'Honey', 'Dabur', '500 g', SP, 275, 315, 4.5, 520),
]

DESCRIPTIONS = [
    'Picked for the shelf this morning and priced to move. Regulars buy it by '
    'the pack, and it keeps well for the week. A steady seller all year round.',
    'One of the lines customers ask for by name. Good quality at an everyday '
    'price, and it rarely sits on the shelf for long.',
    'A cupboard staple worth keeping in stock. Reliable, well packed, and the '
    'sort of thing that quietly ends up in most baskets.',
]

# Six finished orders, spread over the last seven days, in different states, so
# the dashboard and the seven-bar chart have something to draw on day one.
# (days_ago, status, payment_method, delivery_slot, [(product_id, quantity), ...])
DEMO_ORDERS = [
    (6, 'delivered', 'CARD', 'MORNING', [(9, 4), (8, 2)]),
    (5, 'delivered', 'COD', 'EVENING', [(1, 3), (7, 5)]),
    (4, 'shipped', 'CARD', 'AFTERNOON', [(31, 1), (27, 2)]),
    (2, 'shipped', 'COD', 'MORNING', [(12, 2), (30, 4)]),
    (1, 'placed', 'COD', 'EVENING', [(17, 1), (2, 2)]),
    (0, 'cancelled', 'CARD', 'MORNING', [(39, 1)]),
]

DEMO_ADDRESS = {
    'full_name': 'Arjun Mehta',
    'phone': '9876543210',
    'address': '12 Park Street, Flat 4B',
    'city': 'Hyderabad',
    'state': 'Telangana',
    'pincode': '500001',
}


class Command(BaseCommand):
    help = 'Creates the two demo accounts and the 54 seeded grocery products.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--with-orders',
            action='store_true',
            help='Also create six finished orders over the last seven days.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self._clear()

        vendor = self._make_user(VENDOR_USERNAME, 'priya@freshcart.test', User.VENDOR)
        customer = self._make_user(CUSTOMER_USERNAME, 'arjun@freshcart.test', User.CUSTOMER)

        self._make_products(vendor)

        if options['with_orders']:
            self._make_orders(customer)

        self._report(options['with_orders'])

    # ------------------------------------------------------------------ steps

    def _clear(self):
        """Wipe only what this command created, so a second run is harmless."""
        # Deleting the users cascades their products, carts and orders away with
        # them, which is exactly the set of rows this command owns.
        User.objects.filter(
            username__in=[VENDOR_USERNAME, CUSTOMER_USERNAME]
        ).delete()
        Product.objects.filter(pk__in=[row[0] for row in PRODUCTS]).delete()

    def _make_user(self, username, email, user_type):
        return User.objects.create_user(
            username=username,
            email=email,
            password=DEMO_PASSWORD,
            user_type=user_type,
        )

    def _make_products(self, vendor):
        Product.objects.bulk_create([
            Product(
                id=product_id,
                title=title,
                brand=brand,
                unit=unit,
                category=category,
                price=Decimal(price),
                mrp=Decimal(mrp),
                imageUrl=f'https://picsum.photos/seed/item{product_id}/300/300',
                rating=rating,
                total_reviews=reviews,
                description=DESCRIPTIONS[product_id % len(DESCRIPTIONS)],
                availability='Out of Stock' if product_id in OUT_OF_STOCK_IDS else 'In Stock',
                is_deal=product_id in DEAL_IDS,
                vendor=vendor,
            )
            for product_id, title, brand, unit, category, price, mrp, rating, reviews
            in PRODUCTS
        ])

    def _make_orders(self, customer):
        now = timezone.now()
        products = {product.id: product for product in Product.objects.all()}

        for days_ago, status, payment_method, slot, lines in DEMO_ORDERS:
            order = Order.objects.create(
                user=customer,
                status=status,
                payment_method=payment_method,
                delivery_slot=slot,
                is_paid=status == 'delivered' or payment_method == 'CARD',
                shipping=Decimal('0.00'),
                total=Decimal('0.00'),
            )

            total = Decimal('0.00')
            for product_id, quantity in lines:
                product = products[product_id]
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    vendor=product.vendor,
                    title=product.title,
                    brand=product.brand,
                    unit=product.unit,
                    image_url=product.imageUrl,
                    price=product.price,
                    quantity=quantity,
                    status=status,
                )
                total += product.price * quantity

            order.total = total
            order.save(update_fields=['total'])
            Address.objects.create(order=order, **DEMO_ADDRESS)

            # placed_at is auto_now_add, so it has to be backdated afterwards.
            Order.objects.filter(pk=order.pk).update(
                placed_at=now - timedelta(days=days_ago, hours=3)
            )

    def _report(self, with_orders):
        counts = {}
        for row in PRODUCTS:
            counts[row[4]] = counts.get(row[4], 0) + 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(PRODUCTS)} products and 2 users '
            f'({VENDOR_USERNAME}/{DEMO_PASSWORD} vendor, '
            f'{CUSTOMER_USERNAME}/{DEMO_PASSWORD} customer).'
        ))
        for category in (FV, DB, SP, BV, 'Household Care'):
            self.stdout.write(f'  {category}: {counts.get(category, 0)}')
        self.stdout.write(f'  deals of the day: {sorted(DEAL_IDS)}')
        if with_orders:
            self.stdout.write(f'  demo orders: {len(DEMO_ORDERS)}')
