import React from 'react';
import Style from './Overlay.module.css';

import TWEEN from '@tweenjs/tween.js';

function stringToArray(str){
    var array = []
    for(var i in str){
      array.push(str[i])
    }
    return array;
}

class App extends React.Component{
  state={
    author  :   [],
    quote   :   [],
  }
  componentDidMount(){
    window.addEventListener('QuoteMe',(e)=>{
      this.quote.classList.remove(Style.fadeIn);
      this.quote.classList.add(Style.fadeOut);
      this.author.classList.remove(Style.fadeIn);
      this.author.classList.add(Style.fadeOut);
      setTimeout(()=>{
        this.setState({
          quote   : e.quote.Quote,
          author  : e.quote.Author,
        })
        this.quote.classList.remove(Style.fadeOut);
        this.quote.classList.add(Style.fadeIn);
        this.author.classList.remove(Style.fadeOut);
        this.author.classList.add(Style.fadeIn);
      },1000)
    })
  }
  render(){
    return(
      <div id='Display' className={Style.container}>
        <div id='Quote' className={Style.parentTop}>
          <div ref={(r)=>{this.quote = r}}className={Style.quote}>
            {this.state.quote}
          </div>
        </div>
        <div id='Author' className={Style.parentBottom}>
          <div ref={(r)=>{this.author = r}}className={Style.author}>
            {this.state.author}
          </div>
        </div>
      </div>
    )
  }
}
export default App;
