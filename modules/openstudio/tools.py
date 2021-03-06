# -*- coding: utf-8 -*-

from gluon import *


class OsTools:
    """
        General tools
    """
    def calculate_validity_enddate(self, date_start, validity, validity_unit):
        """
        :param date_start: datetime.date startdate 
        :param validity: integer
        :param validity_unit: 'weeks' or 'months' or 'days'
        :return: datetime.date
        """
        def add_months(date_start, months):
            month = date_start.month - 1 + months
            year = int(date_start.year + month / 12)
            month = month % 12 + 1
            last_day_new = calendar.monthrange(year, month)[1]
            day = min(date_start.day, last_day_new)

            ret_val = datetime.date(year, month, day)

            last_day_source = calendar.monthrange(date_start.year,
                                                  date_start.month)[1]

            if date_start.day == last_day_source and last_day_source > last_day_new:
                return ret_val
            else:
                delta = datetime.timedelta(days=1)
                return ret_val - delta

        import calendar
        import datetime

        db = current.db

        if validity_unit == 'months':
            enddate = add_months(date_start, validity)
        else:
            if validity_unit == 'weeks':
                days = validity * 7
            else:
                days = validity

            delta_days = datetime.timedelta(days=days)
            enddate = (date_start + delta_days) - datetime.timedelta(days=1)

        return enddate


    def format_validity(self, validity, unit):
        """
        :param validity: integer
        :param unit: item from validity_units
        :return: formatted validity
        """
        represent_validity_units = current.globalenv['represent_validity_units']

        validity = SPAN(str(validity), ' ')
        validity_in = represent_validity_units(unit)
        if validity == 1:  # Cut the last 's"
            validity_in = validity_in[:-1]

        validity.append(validity_in)

        return validity


    def set_sys_property(self, property, value):
        """
        :param property: string - name of sys property
        :return: None
        """
        db = current.db

        row = db.sys_properties(Property=property)
        if not row:
            db.sys_properties.insert(Property=property,
                                     PropertyValue=value)
        else:
            row.PropertyValue = value
            row.update_record()

        # Clear cache
        from .os_cache_manager import OsCacheManager

        ocm = OsCacheManager()
        ocm.clear_sys_properties()


    def _get_sys_property(self, value=None, value_type=None):
        """
            Returns the value of a property in db.sys_properties
        """
        db = current.db

        property_value = None
        row = db.sys_properties(Property=value)
        if row:
            property_value = row.PropertyValue

        if value_type:
            try:
                return value_type(property_value)
            except:
                pass

        return property_value


    def get_sys_property(self, value=None, value_type=None):
        """
        :param value: db.sys_properties.Property
        :param value_type: Python data type eg. int
        :return: db.sys_properties.PropertyValue
        """
        cache = current.cache
        web2pytest = current.web2pytest
        request = current.request
        CACHE_LONG = current.CACHE_LONG

        cache_key = 'openstudio_system_property_' + value

        # Don't cache when running tests
        if web2pytest.is_running_under_test(request, request.application):
            sprop = self._get_sys_property(value, value_type)
        else:
            sprop = cache.ram(cache_key,
                              lambda: self._get_sys_property(value, value_type),
                              time_expire=CACHE_LONG)

        return sprop


class OsArchiver:
    def parse_request_vars(self, rvars, sesssion_var):
        """
        :param rvars: request.vars
        :return: Boolean
        True when archived record should be shown, False when not
        """
        show = 'current'

        if 'show_archive' in rvars:
            show = request.vars['show_archive']
            session.school_discovery_show = show
            if show == 'current':
                query = (db.school_discovery.Archived == False)
            elif show == 'archive':
                query = (db.school_discovery.Archived == True)
        elif session.school_discovery_show == 'archive':
            query = (db.school_discovery.Archived == True)
        else:
            session.school_discovery_show = show

        return show_archived


    def archive(self,
                db_table,
                record_id,
                error_message,
                return_url):
        """
        :param db_table: table from db
        :param record_id: id of table
        :param error_message: message to display when operation fails
        :param return_url: URL to send user to after operation
        :return: None
        """
        T = current.T
        session = current.session

        if not record_id:
            session.flash = error_message
        else:
            row = db_table(record_id)

            if row.Archived:
                session.flash = T('Moved to current')
            else:
                session.flash = T('Archived')

            row.Archived = not row.Archived
            row.update_record()

        redirect(return_url)


class OsSession:
    def get_request_var_or_session(self,
                                   r_var,
                                   default_value,
                                   session_parameter):
        """
        :param var: variable to search for in request.vars
        :param session_parameter: name of session parameter
        :return: variable when in session.vars, session var when parameter
        found in session otherwise use the default value
        """
        request = current.request
        session = current.session

        if r_var in request.vars:
            value = request.vars[r_var]
        elif session_parameter and not session[session_parameter] is None:
            value = session[session_parameter]
        else:
            value = default_value

        # Set session parameter
        if session_parameter:
            session[session_parameter] = value

        return value