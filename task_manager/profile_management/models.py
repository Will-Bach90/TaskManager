from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(default='default.jpg', upload_to='profile_images')
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    last_activity = models.DateTimeField(default=now)
    current_status = models.TextField(default='Offline')

    def __str__(self):
        return self.user.username

    def add_friend(self, friend):
        if friend != self.user:
            self.friends.add(friend.profile)

    def remove_friend(self, friend):
        if friend in self.friends.all():
            self.friends.remove(friend.profile)

    def is_friend(self, friend):
        return friend in self.friends.all()

    def update_activity(self):
        self.last_activity = now()
        self.current_status = 'Active'
        self.save()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()