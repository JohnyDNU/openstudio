import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router'

import ExpenseAdd from './ExpenseAdd'
import { cashbookOperations } from './duck'


const mapStateToProps = state => 
    ({
        app: state.app,
        cashbook: state.cashbook
    })

const mapDispatchToProps = dispatch =>
    ({
        createExpense(data, history) {
            dispatch(cashbookOperations.createExpense(data, history))
        },
    })


const ExpenseAddContainer = withRouter(injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(ExpenseAdd)))

export default ExpenseAddContainer