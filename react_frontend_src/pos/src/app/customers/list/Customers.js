import React, { Component } from "react"
import { intlShape } from "react-intl"
import PropTypes from "prop-types"
import { NavLink } from 'react-router-dom'
import validator from 'validator'


import PageTemplate from "../../../components/PageTemplate"
import InputGroupSearch from "../../../components/ui/InputGroupSearch"
import ButtonBack from "../../../components/ui/ButtonBack"
import ButtonPrimary from "../../../components/ui/ButtonPrimary"


import CustomersList from "./CustomersList"
import CustomerDisplay from "./CustomerDisplay"
import CustomerFormCreate from "./CustomerFormCreate"

class Customers extends Component {
    constructor(props) {
        super(props)
        console.log("Customers props:")
        console.log(props)
    }

    PropTypes = {
        intl: intlShape.isRequired,
        setPageTitle: PropTypes.function,
        app: PropTypes.object,
        customers: PropTypes.object,
        customers_barcodes: PropTypes.string
    }

    componentWillMount() {
        this.props.setPageTitle(
            this.props.intl.formatMessage({ id: 'app.pos.customers.page_title' })
        )
    }

    componentDidMount() {

    }

    setSearchValue(value) {
        console.log('done something :)!')
        console.log(this.props)
        this.props.clearDisplayCustomerID()
        this.props.clearSearchCustomerID()
        this.props.clearSelectedCustomerID()

        const barcode_scans = this.props.barcode_scans
        const memberships = this.props.memberships.data

        console.log(barcode_scans)
        let cuID

        if (validator.isInt(value)) {
            console.log('This is an int!')
            if (barcode_scans == 'membership_id') {
                // find customer ID
                console.log('looking for cuID in memberships')
                for (const key of Object.keys(memberships)) {
                    let m = memberships[key]
                    console.log(m)
                    if ( m['date_id'] == value) {
                        cuID = m['auth_customer_id']
                    }

                }
            } else {
                cuID = value
            }

            this.props.setDisplayCustomerID(cuID)
            this.props.setSearchCustomerID(cuID)

            console.log('customerID')
            console.log(cuID)

        } else {
            console.log('not an int value')
        }

        console.log(value)
    }

    onChange(e) {
        const value = e.target.value
        const customers = this.props.customers

        this.props.setSearchValue(value)

        console.log("timeout: " + customers.searchTimeout)
        if ( customers.searchTimeout ) {
            this.props.clearSearchTimeout()
            console.log('reset timeout')
        }

        let timeout
        this.props.setSearchTimeout(
            setTimeout(() => this.setSearchValue(value), 
                (validator.isInt(value)) ? timeout = 225 : timeout = 750)
        )
    }

    onClear(e) {
        this.props.clearSearchValue()
    }

    onClickSetCustomer(e) {
        console.log('set customer clicked')
        this.props.setSelectedCustomerID(this.props.customers.displayID)
    }

    onClickDeselectCustomer(e) {
        console.log('Deselect customer clicked')
        this.props.clearSelectedCustomerID()
    }

    onClickButtonBack(e) {
        console.log("clicked")
        this.props.history.push('/products/school/classcards')
    }

    onCreateUser(e) {
        console.log('submit user')
        e.preventDefault()
        console.log(e.target)
        const data = new FormData(e.target)

        console.log(data.values())
        this.props.createCustomer(data)
    }

    render() {
        const customers = this.props.customers
        const intl = this.props.intl
        const memberships = this.props.memberships

        let customers_display = []
        if ( customers.searchID ) {
            customers_display = [
                customers.data[customers.searchID]
            ]
        }
        console.log(customers_display)

        return (
            <PageTemplate app_state={this.props.app}>
                { 
                    (!customers.loaded || !memberships.loaded) ? 
                        <div>{intl.formatMessage({ id: 'app.pos.customers.loading_message' })}</div> :
                        <section className="customers_main">
                            <ButtonBack onClick={this.onClickButtonBack.bind(this)}>
                                Cancel
                            </ButtonBack>
                            <InputGroupSearch placeholder={this.props.intl.formatMessage({ id: 'app.general.placeholders.search' })}
                                              onChange={this.onChange.bind(this)}
                                              onClear={this.onClear.bind(this)}
                                              value={customers.search_value} /> <br />
                            
                            { (customers.displayID) && !(customers.selectedID) ? 
                                <ButtonPrimary onClick={this.onClickSetCustomer.bind(this)}>
                                    Select customer
                                </ButtonPrimary> : ''
                            }
                            { (customers.displayID) && (customers.selectedID) ?
                                <ButtonPrimary onClick={this.onClickDeselectCustomer.bind(this)}>
                                    Deselect customer
                                </ButtonPrimary> : ''   
                            }
                            <CustomerDisplay customerID={customers.displayID}
                                             customers={customers.data} />
                            { (customers.show_create) ?
                                <CustomerFormCreate onSubmit={this.onCreateUser.bind(this)} /> : ''
                            }

                            <CustomersList customers={customers_display}
                                           intl={intl} />
                            {/* <AttendanceList attendance_items={this.props.attendance.data} /> */}
                        </section>
                }
            </PageTemplate>
        )
    }
}

export default Customers
