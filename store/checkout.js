/* eslint-disable camelcase */
import axios from 'axios';

const getLineItems = (item) => {
  if (item) {
    const { custom_items, digital_items, physical_items } = item;
    const items = [...custom_items, ...digital_items, ...physical_items];
    return items.map(({ id, quantity }) => ({ item_id: id, quantity }));
  }
  return [];
};

export const state = () => ({
  isLoading: false,
  // new
  personalDetails: null,
  shippingAddress: null,
  shippingMethods: null,
  billingAddress: null,
  // old
  line_items: [],
  old_consignments: [],
  old_billing_address: {}
});

export const getters = {
  isLoading(state) {
    return state.isLoading;
  },
  // set new checkout data
  personalDetails(state) {
    return state.personalDetails;
  },
  shippingAddress(state) {
    return state.shippingAddress;
  },
  shippingMethods(state) {
    return state.shippingMethods;
  },
  billingAddress(state) {
    return state.billingAddress;
  },
  // For getting old data from checkout
  line_items(state) {
    return state.line_items;
  },
  old_consignments(state) {
    return state.old_consignments;
  },
  old_billing_address(state) {
    return state.old_billing_address;
  }
};

export const mutations = {
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  // new
  SET_PERSONAL_DETAILS(state, personalDetails) {
    state.personalDetails = personalDetails;
  },
  SET_SHIPPING_ADDRESS(state, shippingAddress) {
    state.shippingAddress = shippingAddress;
  },
  SET_SHIPPING_METHODS(state, shippingMethods) {
    state.shippingMethods = shippingMethods;
  },
  SET_BILLING_ADDRESS(state, billingAddress) {
    state.billingAddress = billingAddress;
  },
  // old
  SET_LINE_ITEMS(state, line_items) {
    state.line_items = line_items;
  },
  SET_OLD_CONSIGNMENTS(state, old_consignments) {
    state.old_consignments = old_consignments;
  },
  SET_OLD_BILLING_ADDRESS(state, old_billing_address) {
    state.old_billing_address = old_billing_address;
  }
};

export const actions = {
  getCheckout({ commit }) {
    const checkoutId = window.localStorage.getItem('cartId');
    if (checkoutId) {
      commit('SET_LOADING', true);
      axios.get(`/getCheckout?checkoutId=${checkoutId}`).then(({ data }) => {
        if (data.status) {
          const body = data.body;
          commit('SET_LINE_ITEMS', getLineItems(body?.data?.cart?.line_items));
          commit('SET_OLD_CONSIGNMENTS', body?.data?.consignments);
          commit('SET_OLD_BILLING_ADDRESS', body?.data?.billing_address);
        } else {
          this.$toast.error(data.message);
        }
        commit('SET_LOADING', false);
      });
    }
  },
  setShippingAddress(
    { commit, getters, dispatch },
    { shipping_address, shippingOptionId }
  ) {
    const checkoutId = window.localStorage.getItem('cartId');
    const data = [
      {
        shipping_address,
        line_items: getters.line_items
      }
    ];
    axios
      .post(`setConsignmentToCheckout?checkoutId=${checkoutId}`, { data })
      .then(({ data }) => {
        if (data.status) {
          this.$toast.success(data.message);
          if (shippingOptionId) {
            const consignmentId = data.body?.data?.consignments[0].id;
            dispatch('updateShippingOption', {
              shippingOptionId,
              consignmentId
            });
          } else {
            dispatch('getCheckout');
          }
        } else {
          this.$toast.error(data.message);
        }
        commit('SET_LOADING', false);
      });
  },
  updateShippingOption(
    { commit, dispatch },
    { shippingOptionId, consignmentId }
  ) {
    debugger;
    const checkoutId = window.localStorage.getItem('cartId');
    axios
      .put(
        `updateShippingOption?checkoutId=${checkoutId}&consignmentId=${consignmentId}&shippingOptionId=${shippingOptionId}`
      )
      .then(({ data }) => {
        if (data.status) {
          this.$toast.success(data.message);
          dispatch('getCheckout');
        } else {
          this.$toast.error(data.message);
        }
        commit('SET_LOADING', false);
      });
  },
  setBillingAddress({ commit, dispatch }, billing_address) {
    const checkoutId = window.localStorage.getItem('cartId');
    axios
      .post(`setBillingAddressToCheckout?checkoutId=${checkoutId}`, {
        data: billing_address
      })
      .then(({ data }) => {
        if (data.status) {
          this.$toast.success(data.message);
          dispatch('getCheckout');
        } else {
          this.$toast.error(data.message);
        }
        commit('SET_LOADING', false);
      });
  },
  createOrder({ commit }) {
    const checkoutId = window.localStorage.getItem('cartId');

    axios.post(`createOrder?checkoutId=${checkoutId}`).then(({ data }) => {
      if (data.status) {
        this.$toast.success(data.message);
      } else {
        this.$toast.error(data.message);
      }
      commit('SET_LOADING', false);
    });
  }
};
