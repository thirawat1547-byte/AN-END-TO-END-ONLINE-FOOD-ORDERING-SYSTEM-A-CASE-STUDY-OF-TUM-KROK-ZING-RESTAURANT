import { ref, computed } from 'vue'

const cart = ref([])
const placedOrders = ref([])

export function useCart() {
  const addToCart = (item, quantity = 1, spicyLevel = 'normal', specialInstructions = '', addons = []) => {
    // Generate a unique ID for the cart item based on product and customizations
    const addonString = addons.map(a => a.name).sort().join(',')
    const cartItemId = `${item.id}-${spicyLevel}-${addonString}-${specialInstructions}`
    
    const existingItem = cart.value.find(i => i.cartItemId === cartItemId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.value.push({
        ...item,
        cartItemId,
        quantity,
        spicyLevel,
        specialInstructions,
        addons
      })
    }
  }

  const removeFromCart = (cartItemId) => {
    const index = cart.value.findIndex(i => i.cartItemId === cartItemId)
    if (index !== -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    const item = cart.value.find(i => i.cartItemId === cartItemId)
    if (item) {
      item.quantity = newQuantity
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const placeOrderToHistory = () => {
    // Copy all cart items to placed orders
    cart.value.forEach(item => {
      placedOrders.value.push({...item})
    })
    cart.value = []
  }

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => {
      const addonTotal = item.addons ? item.addons.reduce((sum, addon) => sum + addon.price, 0) : 0
      return total + ((item.price + addonTotal) * item.quantity)
    }, 0)
  })

  const cartItemCount = computed(() => {
    return cart.value.reduce((count, item) => count + item.quantity, 0)
  })

  const billTotal = computed(() => {
    return placedOrders.value.reduce((total, item) => {
      const addonTotal = item.addons ? item.addons.reduce((sum, addon) => sum + addon.price, 0) : 0
      return total + ((item.price + addonTotal) * item.quantity)
    }, 0)
  })

  return {
    cart,
    placedOrders,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrderToHistory,
    cartTotal,
    cartItemCount,
    billTotal
  }
}

