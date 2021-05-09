import { Component } from 'react';
import './App.css';
import Navigation from './Components/Navigation/Navigation'
import Logo from './Components/Logo/Logo'
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank'
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition'
import Signin from './Components/Signin/Signin'
import Register from './Components/Register/Register'


const app = new Clarifai.App({
  apiKey: '806613f654684ac8a2bb72123312651e'
});

const particlesOptions = {
  particles: {
    number: {
      value: 75,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageURL: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }
  
  onInputChange = (event) => {
    console.log(event.target.value);
    this.setState({input: event.target.value})
  }
  
  onButtonSubmit = () => {
    this.setState({imageURL: this.state.input})
    console.log("click")
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    .then(response =>  {
      if (response){
        fetch("https://infinite-hamlet-86368.herokuapp.com/image", {
        method: 'put',
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          id: this.state.user.id,
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(this.setState({user:Object.assign(this.state.user, {entries: count})}))
        console.log(this.state.user.entries, count)
      })
      .catch(console.log)
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
  .catch(err => console.log(err))
  };

  displayFaceBox = (box) => {
  this.setState({box: box})
  console.log(box)
  }

    onRouteChange = (route) => {
      this.setState({route: route});
      if (route === 'signout') {
        this.setState({initialState})
      } else if (route === 'home') {
        this.setState({isSignedIn: true})
      }
    }

  render() {
    const {isSignedIn, imageURL, route, box} = this.state;
    return (
      <div className="App">
      <Particles className='particles'
      params={particlesOptions}
      />
      <Navigation isSignedIn = {isSignedIn} onRouteChange={this.onRouteChange}/>
      {route === 'home'  
      ? <div>
          <Logo />
          <Rank name = {this.state.user.name} entries = {this.state.user.entries}/>
          <ImageLinkForm 
          onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box={box} imageURL={imageURL}/>
      </div>
      : (
        this.state.route === 'signin'
        ? <Signin loadUser = {this.loadUser} onRouteChange={this.onRouteChange}/>
        : <Register loadUser = {this.loadUser} onRouteChange={this.onRouteChange}/>
      )
    }
    </div>
    );
  }
}

export default App;
