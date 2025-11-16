const STORAGE_KEY_TRADES = 'trading-journal-trades'
const STORAGE_KEY_PLANNED_TRADES = 'trading-journal-planned-trades'
const STORAGE_KEY_SETTINGS = 'trading-journal-settings'
const STORAGE_KEY_STRATEGIES = 'trading-journal-strategies'
const STORAGE_KEY_CAPITAL_ADJUSTMENTS = 'trading-journal-capital-adjustments'

export const getTrades = () => {
  try {
    const trades = localStorage.getItem(STORAGE_KEY_TRADES)
    return trades ? JSON.parse(trades) : []
  } catch (error) {
    console.error('Error loading trades:', error)
    return []
  }
}

export const saveTrades = (trades) => {
  try {
    localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(trades))
  } catch (error) {
    console.error('Error saving trades:', error)
  }
}

export const getSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEY_SETTINGS)
    return settings ? JSON.parse(settings) : {
      currency: 'USD',
      startingCapital: 10000,
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    return {
      currency: 'USD',
      startingCapital: 10000,
    }
  }
}

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

export const getStrategies = () => {
  try {
    const strategies = localStorage.getItem(STORAGE_KEY_STRATEGIES)
    return strategies ? JSON.parse(strategies) : []
  } catch (error) {
    console.error('Error loading strategies:', error)
    return []
  }
}

export const saveStrategies = (strategies) => {
  try {
    localStorage.setItem(STORAGE_KEY_STRATEGIES, JSON.stringify(strategies))
  } catch (error) {
    console.error('Error saving strategies:', error)
  }
}

export const getCapitalAdjustments = () => {
  try {
    const adjustments = localStorage.getItem(STORAGE_KEY_CAPITAL_ADJUSTMENTS)
    return adjustments ? JSON.parse(adjustments) : []
  } catch (error) {
    console.error('Error loading capital adjustments:', error)
    return []
  }
}

export const saveCapitalAdjustments = (adjustments) => {
  try {
    localStorage.setItem(STORAGE_KEY_CAPITAL_ADJUSTMENTS, JSON.stringify(adjustments))
  } catch (error) {
    console.error('Error saving capital adjustments:', error)
  }
}

export const getPlannedTrades = () => {
  try {
    const plannedTrades = localStorage.getItem(STORAGE_KEY_PLANNED_TRADES)
    return plannedTrades ? JSON.parse(plannedTrades) : []
  } catch (error) {
    console.error('Error loading planned trades:', error)
    return []
  }
}

export const savePlannedTrades = (plannedTrades) => {
  try {
    localStorage.setItem(STORAGE_KEY_PLANNED_TRADES, JSON.stringify(plannedTrades))
  } catch (error) {
    console.error('Error saving planned trades:', error)
  }
}

