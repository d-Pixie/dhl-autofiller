
var popup = {

  /**
   * Variable to hold the JSONArray of customers
   *
   * @private
   */
  customers: null,

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
   * Resets all the input fields in the form.
   *
   * @private
   */
  reset_the_input_fields: function () {
    var map = {
      'id': '',
      'name': '',
      'address': '',
      'zipcode': '',
      'city': '',
      'phone': '',
      'email': '',
    };

    this.set_form_values_from_map( map );
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
    req.onload = this.handle_customers_response.bind(this);
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
  show_customer: function () {
    var id, customer;

    this.log("Entering show_customer");

    id = this.get_selected_customers_id();
    customer = this.customers[ id ];

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
   * Creates a new select node with a default option.
   *
   * @private
   */
  create_select_element: function(){
    var select;

    select = document.createElement('select');
    select.setAttribute( 'id', 'customers' );
    select.setAttribute( 'class', 'customers' );

    select.appendChild( this.create_option_element( 'Välj kund', 'Välj kund' ));

    return select;
  },

  /**
   * Creates a new option node from given values.
   *
   * @private
   */
  create_option_element: function( value, text ) {
    var option;

    option = document.createElement('option');
    option.setAttribute( 'value', value );
    option.appendChild( document.createTextNode( text ));

    return option;
  },

  /**
   * @private
   *
   * Updates the #customers select input with new values based on the given
   * array of customer objects.
   *
   * @param {Object[]} customers, Array of customer objects with customer id as
   * key and the corresponding customer as value.
   */
  update_customer_select_element: function( customers ){
    var select, customer, old_select, parent;

    select = this.create_select_element();

    Object.keys( customers ).forEach( function( key ){
      customer = customers[ key ];
      select.appendChild( this.create_option_element( customer.id, customer.name ));
    });

    old_select = document.getElementById( 'customers' );
    parent = old_select.parentNode;
    parent.replaceChild( select, old_select );
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
  parse_customers_JSON: function( json ){
    var customers_array, customers;

    customers_array = JSON.parse( json );
    customers = {}

    customers_array.forEach( function( customer ){
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
  handle_customers_response: function( event ){
    var response, customers;

    this.log("Entering handle_customers_response");

    response = event.target.responseText;
    this.customers = parse_customers_JSON( response );
    this.update_customer_select_element( this.customers );
  },

  /**
   * Display an error message in the error container
   *
   * @param {string} message, the message to be displayed
   *
   * @private
   */
  error: function( message ){
    var error_container;

    this.log( 'Error: ' + message );

    error_container = document.getElementById( 'error' );

    error_container.innerHTML = message;
  },

  /**
   * If the setting Debug is enabled - we pass on the message to
   * the window.console
   *
   * @param {string} message, the message to be logged
   *
   * @private
   */
  log: function( message ){
    var debug;
    
    debug = localStorage[ 'debug' ] === 'true';

    if( !debug ){ return; }
    
    window.console.log( message );
  }
};

document.addEventListener('DOMContentLoaded', function () {
  popup.load_customers();
});

document.getElementById('reload').addEventListener('click', function () {
  popup.load_customers();
});

document.getElementById('customers').addEventListener('change', function () {
  popup.show_customer();
});

document.getElementById('send_info').addEventListener('click', function () {
  popup.fillDhlForm();
});
