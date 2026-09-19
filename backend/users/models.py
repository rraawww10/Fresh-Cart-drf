from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Django's own user with one extra column: user_type."""

    CUSTOMER = 'customer'
    VENDOR = 'vendor'

    USER_TYPE_CHOICES = [
        (CUSTOMER, 'Customer'),
        (VENDOR, 'Vendor'),
    ]

    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default=CUSTOMER,
    )

    @property
    def is_vendor(self):
        return self.user_type == self.VENDOR

    def __str__(self):
        return self.username
