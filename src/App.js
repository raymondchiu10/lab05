import React, { Component } from 'react';
import './App.css';
import mySocket from "socket.io-client";
import Rooms from "./comp/Rooms";

class App extends Component {
    constructor(props){
        super(props);
        
        this.state = {
            myImg:require("./imgs/1.png"),
            myImg2:require("./imgs/2.png"),
            allUsers:[],
            myId: null,
            showDisplay: false,
            stickers: []
        }
        this.handleImage = this.handleImage.bind(this);
        this.handleDisplay = this.handleDisplay.bind(this);
    }
    
    componentDidMount(){
        
        this.socket = mySocket("http://localhost:10000");
        
        this.socket.on("userjoined", (data)=>{
           this.setState({
               allUsers:data
           }) 
        });
        
        this.socket.on("yourid", (data)=>{
            this.setState({
                myId:data
            })
            this.refs.thedisplay.addEventListener("mousemove", (ev)=>{

                if(this.state.myId === null){
                    //FAIL
                    return false;
                }

                this.refs["u"+this.state.myId].style.left = ev.pageX + "px";
                this.refs["u"+this.state.myId].style.top = ev.pageY + "px";

                this.socket.emit("mymove", {
                    x: ev.pageX + "px",
                    y: ev.pageY + "px",
                    id: this.state.myId,
                    src: this.refs["u"+this.state.myId].src
                })
            });
            
            this.refs.thedisplay.addEventListener("click", (ev)=> {
                this.socket.emit("stick", {
                    x: ev.pageX,
                    y: ev.pageY,
                    src: this.refs["u"+this.state.myId].src
                });
            });
        });
        
        this.socket.on("newsticker", (data)=> {
            this.setState({
                stickers:data
            });
        });
        
        this.socket.on("newmove", (data)=>{
            this.refs["u"+data.id].style.left = data.x;
            this.refs["u"+data.id].style.top = data.y;
            this.refs["u"+data.id].src = data.src;
        })
        
    }
    
    handleImage(evt){
        this.refs["u"+this.state.myId].src = evt.target.src;
    }
    
    handleDisplay(roomString){
        this.setState({
            showDisplay: true
        });
        
        this.socket.emit("joinroom", roomString);
    }
    
    render() {
        
        var allImgs = this.state.allUsers.map((obj, i)=>{
            return (
                <img ref={"u"+obj} className="allImgs" src={this.state.myImg} height={50} key={i} />
            )
        });
        
        var allstickers = this.state.stickers.map((obj, i)=>{
            var mstyle = {left: obj.x, top:obj.y};
            return (
                <img style={mstyle} key={i} src={obj.src} height={50} className="allImgs" />
            )
        })
        
        var comp = null;
        
        if (this.state.showDisplay == false){
            comp = <Rooms 
                    handleDisplay = {this.handleDisplay}
                    />
        } else {
            comp = (
                <div>
                    <div ref="thedisplay" className="display">
                        {allImgs}
                        {allstickers}
                    </div>

                    <div className="controls">
                        {this.state.myId} <br/><br/>
                        <img src={this.state.myImg} height={50} onClick={this.handleImage} />
                        <img src={this.state.myImg2} height={50} onClick={this.handleImage} />
                    </div> 
                </div>

            );
        }
        
        
        return (
            <div className="App">
                {comp}
            </div>
        );
    }
}

export default App;
