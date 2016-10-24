import React from 'react'

import Month from './month'
import MonthHeader from './month_header'
import {BLOCK_CLASS_NAME} from './consts'

import startOfMonth from 'date-fns/start_of_month'
import isSameMonth from 'date-fns/is_same_month'
import isValidDate from 'date-fns/is_valid'

const SINGLE_MODE = 'single'
const RANGE_MODE = 'range'

const isValid = function(date) {
  try {
    return isValidDate(date)
  } catch (e) {
    return false
  }
}

export default class Calendar extends React.Component {
  static propTypes = {
    MonthHeaderComponent: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.func
    ]),
    activeMonth: React.PropTypes.instanceOf(Date),
    blockClassName: React.PropTypes.string,
    headerNextArrow: React.PropTypes.element,
    headerNextTitle: React.PropTypes.string,
    headerPrevArrow: React.PropTypes.element,
    headerPrevTitle: React.PropTypes.string,
    highlighted: React.PropTypes.shape({
      start: React.PropTypes.instanceOf(Date).isRequired,
      end: React.PropTypes.instanceOf(Date).isRequired,
    }),
    maxDate: React.PropTypes.instanceOf(Date),
    minDate: React.PropTypes.instanceOf(Date),
    minNumberOfWeeks: React.PropTypes.number,
    mode: React.PropTypes.oneOf([SINGLE_MODE, RANGE_MODE]),
    onDayHover: React.PropTypes.func,
    onMonthChange: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    onSelectionProgress: React.PropTypes.func,
    rangeLimit: React.PropTypes.number,
    selected: React.PropTypes.oneOfType([
      React.PropTypes.instanceOf(Date),
      React.PropTypes.shape({
        start: React.PropTypes.instanceOf(Date).isRequired,
        end: React.PropTypes.instanceOf(Date).isRequired,
        inProgress: React.PropTypes.bool
      })
    ]),
    today: React.PropTypes.instanceOf(Date)
  }

  static defaultProps = {
    mode: SINGLE_MODE,
    blockClassName: BLOCK_CLASS_NAME
  }

  constructor(props) {
    super(props)
    this.state = {
      activeMonth: this._initialMonth(props),
      selection: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeMonth && !isSameMonth(nextProps.activeMonth, this.props.activeMonth)) {
      this.setState({activeMonth: startOfMonth(nextProps.activeMonth)})
    }
  }

  _initialMonth(props) {
    const {selected, activeMonth, mode, today} = props || this.props

    if (isValid(activeMonth)) {
      return activeMonth
    } else {
      if (selected) {
        const selectionStart = (mode === SINGLE_MODE ? selected : selected.start)
        if (isValid(selectionStart)) {
          return startOfMonth(selectionStart)
        }
      }
    }
    return startOfMonth(today || new Date())
  }

  _switchMonth(date) {
    const {onMonthChange} = this.props
    if (typeof onMonthChange === 'function') {
      onMonthChange(date)
    } else {
      this.setState({
        activeMonth: date
      })
    }
  }

  _activeMonth() {
    const {onMonthChange, activeMonth} = this.props
    if (onMonthChange) {
      return activeMonth
    } else {
      return this.state.activeMonth
    }
  }

  _highlight() {
    const {highlighted} = this.props
    if (!highlighted) return {start: null, end: null}

    const {start, end} = highlighted

    if (isValid(start) && isValid(end)) {
      return {start, end}
    } else {
      return {start: null, end: null}
    }
  }

  _selection() {
    const start = this._selectionStart()
    const end = this._selectionEnd()

    if (isValid(start) && isValid(end)) {
      return {start, end}
    } else {
      return {start: null, end: null}
    }
  }

  _selectionStart() {
    return this._selectionDate('start')
  }

  _selectionEnd() {
    return this._selectionDate('end')
  }

  _selectionDate(dateType) {
    const {selected, onSelectionProgress} = this.props
    const {selection} = this.state

    switch (this.props.mode) {
      case SINGLE_MODE:
        return selected

      case RANGE_MODE:
        if (!onSelectionProgress && selection) {
          return selection[dateType]
        } else {
          return selected && selected[dateType]
        }
    }
  }

  _selectionChanged(selection) {
    const {start, end, inProgress} = selection
    const {mode, onSelect, onSelectionProgress} = this.props

    if (onSelect && (mode !== RANGE_MODE || !inProgress)) {
      onSelect(mode === SINGLE_MODE ? start : {start, end})
    }

    if (mode === RANGE_MODE) {
      if (onSelectionProgress) {
        onSelectionProgress(selection)
      } else {
        this.setState({selection: inProgress ? {start, end} : null})
      }
    }
  }

  _today() {
    return this.props.today || new Date()
  }

  render() {
    const {
      blockClassName,
      headerNextArrow,
      headerNextTitle,
      headerPrevArrow,
      headerPrevTitle,
      highlighted,
      maxDate,
      minDate,
      minNumberOfWeeks,
      mode,
      onDayHover,
      rangeLimit
    } = this.props
    const selection = this._selection()
    const highlight = this._highlight()
    const MonthHeaderComponent = this.props.MonthHeaderComponent || MonthHeader

    return (
      <div className={blockClassName}>
        <MonthHeaderComponent
          ref='header'
          minDate={minDate}
          maxDate={maxDate}
          headerPrevArrow={headerPrevArrow}
          headerPrevTitle={headerPrevTitle}
          headerNextArrow={headerNextArrow}
          headerNextTitle={headerNextTitle}
          activeMonth={this._activeMonth()}
          onMonthChange={this._switchMonth.bind(this)}
          blockClassName={blockClassName}
        />
        <Month
          mode={mode}
          minDate={minDate}
          maxDate={maxDate}
          minNumberOfWeeks={minNumberOfWeeks}
          rangeLimit={rangeLimit}
          today={this._today()}
          ref='month'
          activeMonth={this._activeMonth()}
          selectedMin={selection.start}
          selectedMax={selection.end}
          onDayHover={onDayHover}
          highlightedStart={highlight.start}
          highlightedEnd={highlight.end}
          onChange={this._selectionChanged.bind(this)}
          blockClassName={blockClassName}
        />
      </div>
    )
  }
}
