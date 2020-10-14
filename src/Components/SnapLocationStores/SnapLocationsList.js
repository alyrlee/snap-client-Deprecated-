import React, { Component } from "react";
import MapContainer from "../GoogleMap/GooglePlaces";

class SnapLocationsList extends Component {
  static defaultProps = {
      snapLocationsList: {}
}; 

render() {
  //destructuring 
  // const snapLocationsList = Object.keys(snapLocationsList);
  const { snapLocationsList } = this.props;
  console.log(typeof snapLocationsList);
  return (
        <React.Fragment>
          <div className="snap_locations_list"> { 
            this.props.snapLocationsList.map((SLL) => {
                if (snapLocationsList) {
                    this.props.snapLocationsList.map(SLL => {
                      return (
                        <div key={SLL.Store_Name} className="placename">
                        {SLL.ObjectId}
                        {SLL.Address}
                        {SLL.Address_Line_2}
                        {SLL.City}
                        {SLL.State}
                        {SLL.Zip5}
                        {SLL.Zip4}
                        {SLL.County}
                        {SLL.Longitude}
                        {SLL.Latitude}            
                        </div>
                      );
                 })}
            })} 
          </div>    
          <div className="snapmap"> 
            <MapContainer snapLocationsList={snapLocationsList} />
          </div> 
        </React.Fragment>
            
    );
  } 
} 
                       
export default SnapLocationsList;