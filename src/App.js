import React, { Component } from 'react';
import FaSpinner from "react-icons/lib/fa/spinner";
import _ from "lodash";
import './App.css';
import axios from 'axios';
import { withGoogleMap, GoogleMap, InfoWindow, Marker, } from "react-google-maps";
import MarkerClusterer from "react-google-maps/lib/addons/MarkerClusterer";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import withScriptjs from "react-google-maps/lib/async/withScriptjs";
const key = require ("./apikey.js");

const googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.27&libraries=places,geometry&key="+key





const Map = _.flowRight(
  withScriptjs,
  withGoogleMap,
)(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={13}
    defaultCenter={{lat:43.651986, lng:-79.383296}}  
    googleMapURL={googleMapURL}
  >
    <MarkerClusterer
      averageCenter={props.defaultCenter}
      enableRetinaIcons={true}
      gridSize={20} 
    > 
      {props.markers.map(marker => (
        <Marker
          position={{lat:marker.latitude, lng:marker.longitude}}
          key={marker.key}
          onClick={() => props.onMarkerClick(marker)}
          >
         {marker.showInfo && (
        <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
          <div className="popup">
            <h2>{marker.address}</h2>
            <img src={marker.photo}></img>
            <h3>${marker.price}</h3>
            <div className="rooms">
            <h4>Bedrooms: {marker.bedrooms}</h4>
            <h4>Bathrooms: {marker.bathrooms}</h4>
            </div>
            <p>{marker.description}</p>
          </div> 
        </InfoWindow> 
        )} 
        </Marker>
      ))}

    </MarkerClusterer>
  </GoogleMap>
));



/*
 * Add <script src="https://maps.googleapis.com/maps/api/js"></script> to your HTML to provide google.maps reference
 */
class App extends Component {
  state = {
    markers: [],
    minPrice: 0,
    maxPrice: 1000000,
    listingType: 2,
  }
    handleMarkerClick = this.handleMarkerClick.bind(this);
    handleMarkerClose = this.handleMarkerClose.bind(this);
    minHandleChange = this.minHandleChange.bind(this);
    maxHandleChange = this.maxHandleChange.bind(this);
    listingHandleChange = this.listingHandleChange.bind(this);

  //Function setState of listingType to what is selected in ListingType dropdown
  listingHandleChange (event, index, listingType){
    this.setState({listingType});
  };

  //Function setState of minPrice to price selected on MinPrice Dropdown Menu
  minHandleChange (event, index, minPrice) {
      this.setState({minPrice});
  };
   
  //Function setState of maxPrice to price selected on MaxPrice Dropdown Menu 
  maxHandleChange (event, index, maxPrice) {
    this.setState({maxPrice});
  };

  // Function for showing listing info when pin is clicked. 
  // Toggle to 'true' to show InfoWindow and re-renders component
  handleMarkerClick(targetMarker) {
    this.setState({
      markers: this.state.markers.map(marker => {
        if (marker === targetMarker) {
          return {
            ...marker,
            showInfo: true,
          };
        }
        return marker;
      }),
    });
  }

  //Function for when listing detail is closed. 
  handleMarkerClose(targetMarker) {
    this.setState({
      markers: this.state.markers.map(marker => {
        if (marker === targetMarker) {
          return {
            ...marker,
            showInfo: false,
          };
        }
        return marker;
      }),
    });
  }

//Inital Get Request to Express Server used to pull data from Realtor.ca in real-time.
  componentWillMount() {
   let dataHolder = [];
    axios.get('http://localhost:8080')
      .then(res => {
        console.log(res.data)
      // .then(data => {
        for(let i = 0; i < res.data.Results.length; i++){
          let info = new Listings(res.data.Results[i])
          dataHolder.push(info);
          
        }
        console.log(dataHolder);
        this.setState({ 
          markers: dataHolder
        },
          // console.log(this.state));
        )
      });
    function Listings(data){
      this.latitude = JSON.parse(data.Property.Address.Latitude);
      this.longitude = JSON.parse(data.Property.Address.Longitude);
      this.price = Number(data.Property.Price.replace(/\D/g,''));
      this.photo = data.Property.Photo ? data.Property.Photo[0].HighResPath : '';
      this.address = (data.Property.Address.AddressText);
      this.bathrooms = (data.Building.BathroomTotal);
      this.bedrooms = (data.Building.Bedrooms);
      this.description = (data.PublicRemarks);
      this.key = JSON.parse(data.Id);
      this.showInfo = false;
    }
  }

    componentWillUpdate(nextProps, nextState){
      let dataHolder = [];
      if (nextState.listingType == this.state.listingType && nextState.minPrice == this.state.minPrice && nextState.maxPrice == this.state.maxPrice){ 
        return false;
      }
      axios.post('http://localhost:8080',{
        minPrice: nextState.minPrice,
        maxPrice: nextState.maxPrice,
        listingType: nextState.listingType
      })
        .then(res => {
          console.log(res.data.Results);
        for(let i = 0; i < res.data.Results.length; i++){
          let info = new Listings(res.data.Results[i])
          dataHolder.push(info);
        }
        console.log(dataHolder);
        this.setState({ 
          markers: dataHolder
        },
        )
      })
        .catch(function (error) {
          console.log(error);
      })
        function Listings(data){
        this.latitude = JSON.parse(data.Property.Address.Latitude);
        this.longitude = JSON.parse(data.Property.Address.Longitude);
        this.price = Number(data.Property.Price.replace(/\D/g,''));
        this.photo = data.Property.Photo ? data.Property.Photo[0].HighResPath : '';
        this.address = (data.Property.Address.AddressText);
        this.bathrooms = (data.Building.BathroomTotal);
        this.bedrooms = (data.Building.Bedrooms);
        this.description = (data.PublicRemarks);
        this.key = JSON.parse(data.Id);
        this.showInfo = false;
      }
    
  }
    

  // Number(data.Property.Price.replace(/\D/g,''));
  render() {
      console.log(this.state.minPrice);
      console.log(this.state.maxPrice);
      console.log(this.state.listingType);

      var min = this.state.minPrice;
      var max = this.state.maxPrice
      var filteredList = this.state.markers.filter(function(marker){
        return marker.price >= min && marker.price <= max;
      });
      console.log(filteredList);

    return (
      <div className="App" style={{position: `absolute`, height: `100%`, width: `100%`}}>
    <Header
    markers = {this.state.markers}
    minPrice = {this.state.minPrice}
    maxPrice = {this.state.maxPrice}
    listingType = {this.state.listingType}
    minHandleChange = {this.minHandleChange}
    maxHandleChange = {this.maxHandleChange}
    listingHandleChange = {this.listingHandleChange}
    />
    <Map
    googleMapURL={googleMapURL}
       containerElement={
        <div style={{ height: `91.7%` }} />
      } 
      mapElement={
        <div style={{ height: `100%` }} />
      }
      loadingElement={
          <div style={{ height: `100%` }}>
            <FaSpinner
              style={{
                display: `block`,
                width: `80px`,
                height: `80px`,
                margin: `150px auto`,
                animation: `fa-spin 2s infinite linear`,
              }}
            />
          </div>
        }
      markers={filteredList}
      onMapLoad={() => {}}
      onMapClick={() => {}}
      onMarkerClick={this.handleMarkerClick}
      onMarkerClose={this.handleMarkerClose}

    />
      </div>
    );
  }
}

//Set state of min and max in APP, pass these states into Header.
//Write a function that setsState in App on min-max price depending on 
//prices selected by drop-down.
//This way Min and Max in App is updated according to drop down and thus can
//be used in the filter.method

//Header Component//
class Header extends Component {

  render(){

    const logo = <img src="https://cdn.rawgit.com/faiz-hussain/a5cbe6426a1e61682e03d8584c59cf9d/raw/cd80135cc89175011a89313de6fca4b87903d310/Logo.svg"
    style={{height: "50px", marginLeft: "5px"}}/>;
    return(

  <MuiThemeProvider>
    <div className="header">
      <AppBar style={{ backgroundColor: 'white' }} 
              iconElementLeft={logo}
      >
      <div>
      <SelectField 
        floatingLabelText="Listing Type"
        value={this.props.listingType}
        onChange={this.props.listingHandleChange}
      >
        <MenuItem value={2} primaryText="For Sale" />
        <MenuItem value={3} primaryText="For Rent" />
        <MenuItem value={1} primaryText="Sale/Rent" />
      </SelectField>
      <SelectField
          floatingLabelText="Min-Price"
          value={this.props.minPrice}
          onChange={this.props.minHandleChange}
      >   
          <MenuItem value={0} primaryText="0" />
          <MenuItem value={25000} primaryText="25,000" />
          <MenuItem value={50000} primaryText="50,000" />
          <MenuItem value={75000} primaryText="75,000" />
          <MenuItem value={100000} primaryText="100,000" />
          <MenuItem value={125000} primaryText="125,000" />
          <MenuItem value={150000} primaryText="150,000" />
          <MenuItem value={175000} primaryText="175,000" />
          <MenuItem value={200000} primaryText="200,000" />
          <MenuItem value={225000} primaryText="225,000" />
          <MenuItem value={250000} primaryText="250,000" />
          <MenuItem value={275000} primaryText="275,000" />
          <MenuItem value={300000} primaryText="300,000" />
          <MenuItem value={325000} primaryText="325,000" />
          <MenuItem value={350000} primaryText="350,000" />
          <MenuItem value={375000} primaryText="375,000" />
          <MenuItem value={400000} primaryText="400,000" />
          <MenuItem value={425000} primaryText="425,000" />
          <MenuItem value={450000} primaryText="450,000" />
          <MenuItem value={475000} primaryText="475,000" />
          <MenuItem value={500000} primaryText="500,000" />
          <MenuItem value={525000} primaryText="525,000" />
          <MenuItem value={550000} primaryText="550,000" />
          <MenuItem value={575000} primaryText="575,000" />
          <MenuItem value={600000} primaryText="600,000" />
          <MenuItem value={625000} primaryText="625,000" />
          <MenuItem value={650000} primaryText="650,000" />
          <MenuItem value={675000} primaryText="675,000" />
          <MenuItem value={700000} primaryText="700,000" />
          <MenuItem value={725000} primaryText="725,000" />
          <MenuItem value={750000} primaryText="750,000" />
          <MenuItem value={775000} primaryText="775,000" />
          <MenuItem value={800000} primaryText="800,000" />
          <MenuItem value={825000} primaryText="825,000" />
          <MenuItem value={850000} primaryText="850,000" />
          <MenuItem value={875000} primaryText="875,000" />
          <MenuItem value={900000} primaryText="900,000" />
          <MenuItem value={925000} primaryText="925,000" />
          <MenuItem value={950000} primaryText="950,000" />
          <MenuItem value={1000000} primaryText="1,000,000" />
          <MenuItem value={1500000} primaryText="1,500,000" />
          <MenuItem value={2000000} primaryText="2,000,000" />
          <MenuItem value={2500000} primaryText="2,500,000" />
          <MenuItem value={3000000} primaryText="3,000,000" />
          <MenuItem value={3500000} primaryText="3,500,000" />
          <MenuItem value={4000000} primaryText="4,000,000" />
          <MenuItem value={4500000} primaryText="4,500,000" />
          <MenuItem value={5000000} primaryText="5,000,000" />
      </SelectField>
      </div>
      <div>   
      <SelectField
          floatingLabelText="Max-Price"
          value={this.props.maxPrice}
          onChange={this.props.maxHandleChange}

      >
          <MenuItem value={25000} primaryText="25,000" />
          <MenuItem value={50000} primaryText="50,000" />
          <MenuItem value={75000} primaryText="75,000" />
          <MenuItem value={100000} primaryText="100,000" />
          <MenuItem value={125000} primaryText="125,000" />
          <MenuItem value={150000} primaryText="150,000" />
          <MenuItem value={175000} primaryText="175,000" />
          <MenuItem value={200000} primaryText="200,000" />
          <MenuItem value={225000} primaryText="225,000" />
          <MenuItem value={250000} primaryText="250,000" />
          <MenuItem value={275000} primaryText="275,000" />     
          <MenuItem value={300000} primaryText="300,000" />
          <MenuItem value={325000} primaryText="325,000" />
          <MenuItem value={350000} primaryText="350,000" />
          <MenuItem value={375000} primaryText="375,000" />
          <MenuItem value={400000} primaryText="400,000" />
          <MenuItem value={425000} primaryText="425,000" />
          <MenuItem value={450000} primaryText="450,000" />
          <MenuItem value={475000} primaryText="475,000" />
          <MenuItem value={500000} primaryText="500,000" />
          <MenuItem value={525000} primaryText="525,000" />
          <MenuItem value={550000} primaryText="550,000" />
          <MenuItem value={575000} primaryText="575,000" />
          <MenuItem value={600000} primaryText="600,000" />
          <MenuItem value={600000} primaryText="600,000" />
          <MenuItem value={625000} primaryText="625,000" />
          <MenuItem value={650000} primaryText="650,000" />
          <MenuItem value={675000} primaryText="675,000" />
          <MenuItem value={700000} primaryText="700,000" />
          <MenuItem value={700000} primaryText="700,000" />
          <MenuItem value={725000} primaryText="725,000" />
          <MenuItem value={750000} primaryText="750,000" />
          <MenuItem value={775000} primaryText="775,000" />
          <MenuItem value={800000} primaryText="800,000" />
          <MenuItem value={800000} primaryText="800,000" />
          <MenuItem value={825000} primaryText="825,000" />
          <MenuItem value={850000} primaryText="850,000" />
          <MenuItem value={875000} primaryText="875,000" />
          <MenuItem value={900000} primaryText="900,000" />
          <MenuItem value={925000} primaryText="925,000" />
          <MenuItem value={950000} primaryText="950,000" />
          <MenuItem value={975000} primaryText="975,000" />
          <MenuItem value={1000000} primaryText="1,000,000" />
          <MenuItem value={1500000} primaryText="1,500,000" />
          <MenuItem value={2000000} primaryText="2,000,000" />
          <MenuItem value={2500000} primaryText="2,500,000" />
          <MenuItem value={3000000} primaryText="3,000,000" />
          <MenuItem value={3500000} primaryText="3,500,000" />
          <MenuItem value={4000000} primaryText="4,000,000" />
          <MenuItem value={4500000} primaryText="4,500,000" />
          <MenuItem value={5000000} primaryText="5,000,000" />
          <MenuItem value={10000000} primaryText="10,000,000" />

      </SelectField>
      </div>
      </AppBar>
    </div>
  </MuiThemeProvider>
    )
  }
}


export default App;
