import React, {Component} from 'react';
import MapContainer from '../GoogleMap/GooglePlaces'; 
import AuthApiService from '../Services/auth-api-service';
import snapLocationsList from '../SnapLocationStores/SnapLocationsList';

export default class MapLanding extends Component {
  constructor(props){
   super(props);
   this.state = {data: [], stores: [],error: null } ;
  }

  // onSelect = () => {
  //   const response = fetch(`${config.API_ENDPOINT}/stores`)
  //   .then(response => {
  //     console.log('data', response.json());
  //     console.log('data 2',response.data.results);
  //   });
  //   this.setState({ snapLocationsList: response.data.results,
  //     data: data});
  //     console.log('json data', data);
  //   }

componentDidMount(){
  const resJSON=
  AuthApiService.getStores()
  .then(resJSON => {
    console.log('data', resJSON());
        console.log('data 2',resJSON.data.results);
      });
    this.setState({ snapLocationsList: resJSON.data.results,
      data: resJSON});
      console.log('json data', resJSON);
    }

// {this.markers = resJSON && !error ? resJSON.slice(0, 200): []}

   render() {
    return (
      <div className="ui container" style={{ marginTop: '10px' }}>
        {/* <SnapLocationsList stores={this.state.data} />
        Found: {this.state.data.length} SnapLocationsList */}
        <MapContainer 
          snapLocationsList={this.state.data} 
          // onSelect={this.onSelect} 
          markers = {this.state.data}  
       />  
      </div>
    );
  }
}
