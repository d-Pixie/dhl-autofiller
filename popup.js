
var popup = {

  /**
    * Variable to hold the JSONArray of customers
    *
    * @private
    */
  customers: null,

  /**
   * Gets an DOM node by id
   *
   * @private
   */
  element_by_id: function ( id ) {
    return document.getElementById( id ); 
  }

  /**
   * Resets all the input fields in the form.
   *
   * @private
   */
  reset_the_input_fields: function () {
    var ids = ['id', 'name', 'address', 'zipcode', 'city', 'phone', 'email'];

    ids.forEach( function( id ){
      this.element_by_id( id ).value = '';  
    });
  },

  /**
   * Loads endpoint from localstorage and verifies it's not empty.
   *
   * @private
   */
  get_customers_url: function () {
    var endpoint = localStorage['endpoint'];

    if (endpoint.length === 0) {
      this.error("<br>Woppwopp, det verkar inte finnas någon endpoint konfigurerad. Gör det först och försök sedan igen!<br><br>");
      return;
    }

    this.log("Endpoint is " + endpoint + " initiating XMLHttpRequest");

    return endpoint;
  },

  /**
   * Resets all the input fields in the form.
   *
   * @private
   */
  request_customers: function (url) {
    var req;

    req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onload = this.createCustomerOptions.bind(this);
    req.send(null);
  },

  /**
   * Attempts to load the customers from the endpoint url saved in localstorage.
   *
   * @public
   */
  load_customers: function () {
    var url;

    this.log("Entering load_customers");
    this.reset_the_input_fields();

    url = this.get_customers_url();
    this.request_customers_from_endpoint( url );
  },

  /**
   * Get customer id from the selected element in the select box.
   *
   * @private
   */
  get_selected_customers_id: function () {
    var select_element, selected_index, select_value;

    select_element = document.getElementById('customers');
    selected_index = select_element.selectedIndex;
    select_value = select_element.options[ selected_index ].value

    return select_value;
  },

  /**
   * Sets an DOM nodes value by id
   *
   * @private
   */
  set_value_by_id: function ( id, value ) {
    return document.getElementById( id ).value = value; 
  },

  /**
   * Sets an set of DOM nodes values by id
   *
   * @private
   */
  set_form_values_from_map: function( obj ){
    Object.keys( obj ).forEach( function( id ){
      this.set_value_by_id( id, obj[ id ]);
    })
  },  

  /**
   * Updates form element values based on the given customer data.
   *
   * @private
   */
  update_form_with_customer_data: function (customer) {
    var map = {
      'id': customer.id,
      'name': customer.name,
      'address': customer.address,
      'zipcode': customer.zipcode,
      'city': customer.city,
      'phone': customer.phone,
      'email': customer.email,
    };

    this.set_form_values_from_map( map );
  },

  /**
   * Populate the customer data in the related fields
   *
   * @public
   */
  populateCustomerData: function () {
    var id, customer;

    this.log("Entering showCustomerData");

    id = this.get_selected_customers_id();
    customer = this.getCustomerById( id );

    this.update_form_with_customer_data( customer );
  },


    /**
    * Get the data from the input fields, build a javascript string
    * and send them through chrome.tab.executeScript to the current
    * active tab
    *
    * @public
    */
    fillDhlForm: function () {

        this.log("Entering fillDhlForm");

        var id = document.getElementById('id').value,
            name = document.getElementById('name').value,
            address = document.getElementById('address').value,
            zipcode = document.getElementById('zipcode').value,
            city = document.getElementById('city').value,
            phone = document.getElementById('phone').value,
            email = document.getElementById('email').value;

        this.log("fillDhlForm data is: ");
        this.log("id: " + id);
        this.log("name: " + name);
        this.log("address: " + address);
        this.log("zipcode: " + zipcode);
        this.log("city: " + city);
        this.log("phone: " + phone);
        this.log("email: " + email);

        var code = 'document.getElementById("id").value = "' + id +'";'+
                    'document.getElementById("name").value = "' + name +'";'+
                    'document.getElementById("addressline.0").value = "' + address +'";'+
                    'document.getElementById("postcode").value = "' + zipcode +'";'+
                    'document.getElementById("city").value = "' + city +'";'+
                    'document.getElementById("contactPerson").value = "' + name +'";'+
                    'document.getElementById("mobile").value = "' + phone +'";'+
                    'document.getElementById("phone").value = "' + phone +'";'+
                    'document.getElementById("email").value = "' + email +'";'+
                    'document.getElementById("type.consignee").checked = true;'+
                    'document.getElementById("type.notify").checked = true;';

        this.log("code: " + code);

        chrome.tabs.executeScript(null, {code: code}, function() {
            this.log("executeScript response received");
        });
    },


  /**
    * Search the 'customers' array for a customer with the passed customerId as id
    *
    * @param {number} customerId, a customer ID
    * @return {Object} customer
    * @private
    */
  getCustomerById: function( id ){
    this.log("Entering getCustomerById", id );

    return this.customers[ id ];
  },

  /**
   * @private
   *
   * Updates the #customers select input with new values based on the passed
   * customers object.
   *
   * @param {Object} customers, Customers objects with customer ids as keys
   * and the corresponding customer as value.
   * @param {Number|String} customers.id
   * @param {String} customers.name
   */
  updateCustomerOptionsDOM: function( customers ){
    var length, options, customer;

    options = '<option value="">V&auml;lj kund</option>';
    length = customers.length;

    Object.keys( customers ).forEach( function( key ){
      customer = customers[ key ];
      options += '<option value="'+ customer.id +'">'+ customer.name +'</option>';
    });

    this.log( 'options are', options );

    document.getElementById( 'customers' ).innerHTML = options;
  },

  /**
   * @private
   *
   * Parses event responseText into a customer object.
   *
   * @param {responseText} responseText, JSON encoded Array of customer objects.
   * @return {Object} An object with customer ids as keys and the corresponding
   * customer as value.
   */
  parseResposetextToCustomers: function( responseText ){
    var customerArray, customers;

    customerArray = JSON.parse( responseText );
    customers = {}

    customerArray.forEach( function( customer ){
      customers[ customer.id ] = customer;
    });

    return customers;
  },

  /**
   * Create the customer options in the 'customers' select object
   *
   * @param {ProgressEvent} e The XHR ProgressEvent.
   * @private
   */
  createCustomerOptions: function( event ){
    this.log("Entering createCustomerOptions");
    var responseText, customers;

    responseText = event.target.responseText;
    customers = getCustomersFromResposetext( responsText );
    this.updateCustomerOptionsDOM( customers );
    this.customers = customers;
  },


    /**
    * Display an error message in the error container
    *
    * @param {string} message, the message to be displayed
    *
    * @private
    */
    error: function(message) {
        this.log("Error: " + message);
        var errorContainer = document.getElementById('error');

        errorContainer.innerHTML = message;
    },


    /**
    * If the setting Debug is enabled - we pass on the message to
    * the window.console
    *
    * @param {string} message, the message to be logged
    *
    * @private
    */
    log: function(message) {
        debug = localStorage['debug'];

        if (debug === 'true') {
            window.console.log(message);
        }
    }

};

document.addEventListener('DOMContentLoaded', function () {
  popup.load_customers();
});

document.getElementById('reload').addEventListener('click', function () {
  popup.load_customers();
});

document.getElementById('customers').addEventListener('change', function () {
  popup.populateCustomerData();
});

document.getElementById('send_info').addEventListener('click', function () {
  popup.fillDhlForm();
});
