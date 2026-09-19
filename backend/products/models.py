from django.conf import settings
from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Fruits & Vegetables', 'Fruits & Vegetables'),
        ('Dairy & Bakery', 'Dairy & Bakery'),
        ('Snacks & Packaged Food', 'Snacks & Packaged Food'),
        ('Beverages', 'Beverages'),
        ('Household Care', 'Household Care'),
    ]

    AVAILABILITY_CHOICES = [
        ('In Stock', 'In Stock'),
        ('Out of Stock', 'Out of Stock'),
    ]

    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    # The pack size, shown next to the title: 1 kg, 500 g, 1 L, 6 pcs.
    unit = models.CharField(max_length=50)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # The price before the discount. It is only ever shown with a line through
    # it — nothing on the server works anything out from it.
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    # camelCase on purpose. See section 13 of the PRD: the class has to read the
    # answer it actually gets instead of guessing that everything is snake_case.
    imageUrl = models.URLField(max_length=500, blank=True)
    rating = models.FloatField(default=0.0)
    total_reviews = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    availability = models.CharField(
        max_length=50,
        choices=AVAILABILITY_CHOICES,
        default='In Stock',
    )
    is_deal = models.BooleanField(default=False)
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
    )

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.title} ({self.unit})'
