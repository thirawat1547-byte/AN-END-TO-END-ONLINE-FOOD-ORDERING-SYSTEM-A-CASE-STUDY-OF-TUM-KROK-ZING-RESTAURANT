import { ref, computed } from 'vue'

const cart = ref([])

export function useCart() {
  const addToCart = (item, quantity = 1, spicyLevel = 'normal', specialInstructions = '') => {
    // Generate a unique ID for the cart item based on product and customizations
    const cartItemId = `${item.id}-${spicyLevel}-${specialInstructions}`
    
    const existingItem = cart.value.find(i => i.cartItemId === cartItemId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.value.push({
        ...item,
        cartItemId,
        quantity,
        spicyLevel,
        specialInstructions
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

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const cartItemCount = computed(() => {
    return cart.value.reduce((count, item) => count + item.quantity, 0)
  })

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  }
}
