import React, { Component } from "react"
import { intlShape } from "react-intl"
import PropTypes from "prop-types"

import CartList from "./CartList"

class Products extends Component {
    constructor(props) {
        super(props)
        console.log(props)
    }

    PropTypes = {
        intl: intlShape.isRequired,
        app: PropTypes.object,
        items: PropTypes.array
    }

    componentWillMount() {
        this.props.setPageTitle(
            this.props.intl.formatMessage({ id: 'app.pos.products' })
        )
    }
    
    render() {
        const items = this.props.items

        return (
            <div className="box box-solid"> 
                <div className="box-header">
                    <h3 className="box-title">
                        <i className="fa fa-shopping-cart"></i> Cart
                    </h3>
                </div>
                <div className="box-body">
                {(items.length) ? 
                    <CartList items={items} />:
                    "The shopping cart is empty" }
                </div>
            </div>    
        )
    }
}

export default Products