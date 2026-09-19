from django.conf import settings
from django.db import models

from products.models import Product

PLACED = 'placed'
SHIPPED = 'shipped'
DELIVERED = 'delivered'
CANCELLED = 'cancelled'

STATUS_CHOICES = [
    (PLACED, 'Placed'),
    (SHIPPED, 'Shipped'),
    (DELIVERED, 'Delivered'),
    (CANCELLED, 'Cancelled'),
]

# A row only ever moves forward, and only one step at a time.
NEXT_STATUS = {
    PLACED: SHIPPED,
    SHIPPED: DELIVERED,
}


class Order(models.Model):
    PAYMENT_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('CARD', 'Card'),
    ]

    # A saved word, exactly like payment_method. Nothing in this project
    # schedules anything from it, and no slot is ever full or blocked.
    DELIVERY_SLOT_CHOICES = [
        ('MORNING', 'Morning 7 to 10'),
        ('AFTERNOON', 'Afternoon 12 to 3'),
        ('EVENING', 'Evening 5 to 8'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    placed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PLACED)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='COD')
    delivery_slot = models.CharField(
        max_length=20, choices=DELIVERY_SLOT_CHOICES, default='MORNING'
    )
    is_paid = models.BooleanField(default=False)
    # The amount actually charged, saved at checkout time rather than worked out
    # later from prices that may have moved since.
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ['-placed_at', '-id']

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def can_cancel(self):
        return self.status == PLACED

    @property
    def thumbnail(self):
        first = self.items.first()
        return first.image_url if first else ''

    def sync_status_from_items(self):
        """An order can hold products from more than one vendor, so it moves at
        the pace of its slowest item."""
        statuses = [item.status for item in self.items.all()]
        if not statuses:
            return

        live = [s for s in statuses if s != CANCELLED]

        if not live:
            new_status = CANCELLED
        elif all(s == DELIVERED for s in live):
            new_status = DELIVERED
        elif all(s in (SHIPPED, DELIVERED) for s in live):
            new_status = SHIPPED
        else:
            new_status = PLACED

        self.status = new_status
        if new_status == DELIVERED:
            self.is_paid = True
        self.save(update_fields=['status', 'is_paid'])

    def __str__(self):
        return f'Order #{self.id}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    # A product can leave the shop. It must not disappear from a purchase that
    # already happened, so the link is emptied rather than the row deleted.
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items'
    )
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sold_items',
    )
    # Copies of the product's values, taken at checkout time. In a grocery shop
    # prices move often, so a row that only linked to the product would quietly
    # rewrite an order somebody already paid for.
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    unit = models.CharField(max_length=50)
    image_url = models.URLField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PLACED)

    class Meta:
        ordering = ['id']

    @property
    def subtotal(self):
        return self.price * self.quantity

    @property
    def next_status(self):
        return NEXT_STATUS.get(self.status)

    def __str__(self):
        return f'{self.quantity} x {self.title}'


class Address(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='address')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)

    def __str__(self):
        return f'{self.full_name}, {self.city}'
