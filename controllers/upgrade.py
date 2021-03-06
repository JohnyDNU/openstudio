# -*- coding: utf-8 -*-

from general_helpers import max_string_length
from general_helpers import get_ajax_loader

from openstudio.os_workshop_product import WorkshopProduct
from openstudio.os_invoice import Invoice

from os_upgrade import set_version


def to_login(var=None):
    redirect(URL('default', 'user', args=['login']))


def index():
    """
        This function executes commands needed for upgrades to new versions
    """
    # first check if a version is set
    if not db.sys_properties(Property='Version'):
        db.sys_properties.insert(Property='Version',
                                 PropertyValue=0)
        db.sys_properties.insert(Property='VersionRelease',
                                 PropertyValue=0)

    # check if a version is set and get it
    if db.sys_properties(Property='Version'):
        version = float(db.sys_properties(Property='Version').PropertyValue)

        if version < 2019.02:
            print(version)
            upgrade_to_201902()
            session.flash = T("Upgraded db to 2019.02")
        if version < 2019.06:
            print(version)
            upgrade_to_201906()
            session.flash = T("Upgraded db to 2019.06")
        if version < 2019.08:
            print(version)
            upgrade_to_201908()
            session.flash = T("Upgraded db to 2019.08")
        else:
            session.flash = T('Already up to date')
        if version < 2019.09:
            print(version)
            upgrade_to_201909()
            session.flash = T("Upgraded db to 2019.09")
        if version < 2019.10:
            print(version)
            upgrade_to_201910()
            session.flash = T("Upgraded db to 2019.10")
        if version < 2019.12:
            print(version)
            upgrade_to_201912()
            session.flash = T("Upgraded db to 2019.12")
        if version < 2019.13:
            print(version)
            upgrade_to_201913()
            session.flash = T("Upgraded db to 2019.13")
        if version < 2019.14:
            print(version)
            upgrade_to_201914()
            session.flash = T("Upgraded db to 2019.14")
        else:
            session.flash = T('Already up to date')

        # always renew permissions for admin group after update
        set_permissions_for_admin_group()

    set_version()

    ##
    # clear cache
    ##
    cache.ram.clear(regex='.*')

    # Back to square one
    to_login()


def upgrade_to_201902():
    """
        Upgrade operations to 2019.02
    """
    ##
    # Update invoice links
    ##
    define_invoices_classes_attendance()
    define_invoices_customers_memberships()
    define_invoices_customers_subscriptions()
    define_invoices_workshops_products_customers()
    define_invoices_customers_classcards()
    define_invoices_employee_claims()
    define_invoices_teachers_payment_classes()

    # Classes attendance
    query = (db.invoices_classes_attendance.id > 0)
    rows = db(query).select(db.invoices_classes_attendance.ALL)
    for row in rows:
        query = (db.invoices_items.invoices_id == row.invoices_id)
        item_rows = db(query).select(db.invoices_items.id)
        item_row = item_rows.first()

        db.invoices_items_classes_attendance.insert(
            invoices_items_id = item_row.id,
            classes_attendance_id = row.classes_attendance_id
        )

    # Customer subscriptions
    query = (db.invoices_customers_subscriptions.id > 0)
    rows = db(query).select(db.invoices_customers_subscriptions.ALL)
    for row in rows:
        query = (db.invoices_items.invoices_id == row.invoices_id)
        item_rows = db(query).select(db.invoices_items.id)
        item_row = item_rows.first()

        db.invoices_items_customers_subscriptions.insert(
            invoices_items_id = item_row.id,
            customers_subscriptions_id = row.customers_subscriptions_id
        )

    # Customer class cards
    query = (db.invoices_customers_classcards.id > 0)
    rows = db(query).select(db.invoices_customers_classcards.ALL)
    for row in rows:
        query = (db.invoices_items.invoices_id == row.invoices_id)
        item_rows = db(query).select(db.invoices_items.id)
        item_row = item_rows.first()

        db.invoices_items_customers_classcards.insert(
            invoices_items_id = item_row.id,
            customers_classcards_id = row.customers_classcards_id
        )

    # Customer memberships
    query = (db.invoices_customers_memberships.id > 0)
    rows = db(query).select(db.invoices_customers_memberships.ALL)
    for row in rows:
        query = (db.invoices_items.invoices_id == row.invoices_id)
        item_rows = db(query).select(db.invoices_items.id)
        item_row = item_rows.first()

        db.invoices_items_customers_memberships.insert(
            invoices_items_id = item_row.id,
            customers_memberships_id = row.customers_memberships_id
        )

    # Customer event tickets
    query = (db.invoices_workshops_products_customers.id > 0)
    rows = db(query).select(db.invoices_workshops_products_customers.ALL)
    for row in rows:
        query = (db.invoices_items.invoices_id == row.invoices_id)
        item_rows = db(query).select(db.invoices_items.id)
        item_row = item_rows.first()

        db.invoices_items_workshops_products_customers.insert(
            invoices_items_id = item_row.id,
            workshops_products_customers_id = row.workshops_products_customers_id
        )

    # Employee claims
    query = (db.invoices_employee_claims.id > 0)
    rows = db(query).select(db.invoices_employee_claims.ALL)
    for row in rows:
        query = (db.invoices_items.invoices_id == row.invoices_id)
        item_rows = db(query).select(db.invoices_items.id)
        item_row = item_rows.first()

        db.invoices_items_employee_claims.insert(
            invoices_items_id = item_row.id,
            employee_claims_id = row.employee_claims_id
        )

    # Teacher payment classes
    query = (db.invoices_teachers_payment_classes.id > 0)
    rows = db(query).select(db.invoices_teachers_payment_classes.ALL)
    for row in rows:
        query = (db.invoices_items.invoices_id == row.invoices_id)
        item_rows = db(query).select(db.invoices_items.id)
        item_row = item_rows.first()

        db.invoices_items_teachers_payment_classes.insert(
            invoices_items_id = item_row.id,
            teachers_payment_classes_id = row.teachers_payment_classes_id
        )


    ##
    # Set default value for db.school_subscriptions.MinDuration
    ##
    query = (db.school_subscriptions.MinDuration == None)
    db(query).update(MinDuration=1)


    ##
    # Insert email templates
    ##
    # Teacher sub offer declined
    db.sys_email_templates.insert(
        Name = 'teacher_sub_offer_declined',
        Title = T('Teacher sub offer declined'),
        Description = '',
        TemplateContent = """
<p>Dear {teacher_name},<br /><br /></p>
<p>As we have been able to fill the sub request for the class above, we would like to inform you that we won't be making use of your offer to teach this class.<br /><br /></p>
<p>We thank you for your offer and hope to be able to use your services again in the future.</p>"""
    )
    # Teacher sub offer accepted
    db.sys_email_templates.insert(
        Name='teacher_sub_offer_accepted',
        Title=T('Teacher sub offer accepted'),
        Description='',
        TemplateContent="""
<p>Dear {teacher_name},<br /><br /></p>
<p>Thank you for taking over the class mentioned above. We're counting on you!</p>"""
    )
    # Teachers sub requests daily summary
    db.sys_email_templates.insert(
        Name = 'teacher_sub_requests_daily_summary',
        Title = T('Teacher sub requests daily summary'),
        Description = '',
        TemplateContent = """<p>Dear {teacher_name},<br /><br /></p>
<p>Below you'll find a list of open classes. We would greatly appreciate it if you could have a look at the list and let us know whether you'd be able to teach one or more classes.</p>
<p>Click <a href="{link_employee_portal}">here</a> to let us know which classes you can teach.</p>"""
    )
    # Teachers sub request open reminder
    db.sys_email_templates.insert(
        Name='teacher_sub_request_open_reminder',
        Title=T('Teacher sub request open reminder'),
        Description='',
        TemplateContent="""<p>Dear {teacher_name},<br /><br /></p>
<p>Using this email we'd like to remind you that a substitute teacher for the class above hasn't been found yet.</p>"""
    )

    ##
    # Set default values for trial times
    ##
    query = (db.school_classcards.TrialTimes == None)
    db(query).update(TrialTimes = 1)

    ##
    # Set default value for system_enable_class_checkin_trialclass to "on"
    # to keep the current default behavior
    ##
    set_sys_property(
        'system_enable_class_checkin_trialclass',
        'on'
    )


def upgrade_to_201906():
    """
        Upgrade operations to 2019.06
    """
    from openstudio.os_invoice import Invoice

    query = (db.customers_notes.Processed == None)
    db(query).update(Processed = True)


    # Insert missing links to customers for some subscription invoices
    left = [
        db.invoices_items.on(
            db.invoices_items_customers_subscriptions.invoices_items_id ==
            db.invoices_items.id
        ),
        db.invoices.on(
            db.invoices_items.invoices_id ==
            db.invoices.id
        ),
        db.invoices_customers.on(
            db.invoices_customers.invoices_id ==
            db.invoices.id
        ),
        db.customers_subscriptions.on(
            db.invoices_items_customers_subscriptions.customers_subscriptions_id ==
            db.customers_subscriptions.id
        ),
        db.auth_user.on(
            db.customers_subscriptions.auth_customer_id ==
            db.auth_user.id
        )
    ]

    query = (db.invoices_customers.id == None)

    rows = db(query).select(
        db.invoices.id,
        db.auth_user.id,
        db.invoices_customers.id,
        left=left
    )

    for row in rows:
        invoice = Invoice(row.invoices.id)
        invoice.link_to_customer(row.auth_user.id)


def upgrade_to_201908():
    """
        Upgrade operations to 2019.08
    """
    # All subscriptions in shop start today
    query = (db.sys_properties.Property == 'shop_subscriptions_start')
    db(query).update(PropertyValue='today')


def upgrade_to_201909():
    """
        Upgrade operations to 2019.09
    """
    ## Refresh thumbnails for all tables
    tables = [
        db.auth_user,
        db.school_classtypes,
        db.shop_products,
        db.shop_products_variants,
        db.workshops
    ]

    for table in tables:
        query = (table.picture != None) & (table.picture != "")
        rows = db(query).select(table.ALL)
        for row in rows:
            import os
            # Save picture file name
            picture = row.picture
            filename = os.path.join(request.folder, 'uploads', picture)
            tempfile = os.path.join(request.folder, 'uploads', picture + "_temp")
            # Move to temp file name
            try:
                os.rename(filename, tempfile)
            except FileNotFoundError:
                continue
            # Remove db mapping
            row.update_record(picture = None, thumbsmall = None, thumblarge = None)
            # move file back
            os.rename(tempfile, filename)
            # Save again with picture to trigger thumbnail generation
            # This makes w2p think there's a new image
            row.update_record(picture = picture)


def upgrade_to_201910():
    """
        Upgrade operations to 2019.10
    """
    db.sys_properties.insert(
        Property="shop_allow_trial_classes_for_existing_customers",
        PropertyValue="on"
    )
    db.sys_properties.insert(
        Property="shop_classes_trial_limit",
        PropertyValue="1"
    )


def upgrade_to_201912():
    """
        Upgrade operations to 2019.12
    """
    ##
    # Set default value for "direct debit" (payment method 3)
    # db.customers_subscriptions.Origin & Verified
    # Origin is set to "BACKEND" for all current subscriptions
    # Verified is set to True for all current subscriptions
    ##
    query = (db.customers_subscriptions.Origin == None) & \
            (db.customers_subscriptions.payment_methods_id == 3)
    db(query).update(
        Origin = "BACKEND",
        Verified = "T"
    )


def upgrade_to_201913():
    """
        Upgrade operations to 2019.13
    """
    ##
    # Set default value for "WalkInSpaces" field in db.classes
    # 3 as a sensible default
    ##
    query = (db.classes.WalkInSpaces == None)
    db(query).update(
        WalkInSpaces = 3
    )


def upgrade_to_201914():
    """
        Upgrade operations to 2019.14
    """
    ## Set length for all barcode_id fields in auth_user to 14 (when they have a value)
    query = (db.auth_user.barcode_id != None) & \
            (db.auth_user.barcode_id != "")

    rows = db(query).select(db.auth_user.ALL)
    for row in rows:
        if len(row.barcode_id) > 13:
            row.barcode_id = row.barcode_id[1:]
        row.barcode = None
        row.update_record()
