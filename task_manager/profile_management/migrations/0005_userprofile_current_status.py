# Generated by Django 5.1.3 on 2024-12-01 05:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profile_management', '0004_userprofile_last_activity'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='current_status',
            field=models.TextField(default='Offline'),
        ),
    ]
