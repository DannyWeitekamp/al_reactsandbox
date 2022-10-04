import React, { Component, createRef, useState, useEffect, useRef, Profiler } from 'react'
import { motion, useMotionValue, useSpring, useScroll } from "framer-motion";
// import * as Animatable from 'react-native-animatable';
import autobind from "class-autobind";
import './App.css';
import './components/scrollbar.css';
import create from "zustand";


const useStore = create((set) => ({
  boop1: {"A": 0, "B" :1},
  boop2: {"A": 3, "B" :4},
  lst: [{"A": 0, "B" :1}],
  
  setBoop1A: (A) =>
   set((state) => ({
     boop1: {...state.boop1, A : A}
   })),
  setBoop1B: (B) =>
   set((state) => ({
     boop1: {...state.boop1, B : B}
   })),

   setBoop2B: (B) =>
   set((state) => ({
     boop2: {...state.boop1, B : B}
   })),
}));

/*Implements useChangedStore hook
   Takes a list of accessors strings like for example "@object.child.id"
   where presence of "@" indicates that the accessed value should be checked 
   for a change before rerendering. In the absence of an "@" decorated accessor,
   no checks are made. Optionally a custom check like (old,new) =>{whatever}
   can be provided [["object.child.id", (old,new) =>{whatever}],...]
*/
const useChangedStore = (args) =>{
  args = args.map((x)=>Array.isArray(x) ? x : [x])
  let f = (s) =>{
    let out = []
    for(let [accessor,...[cmp]] of args){
      if(accessor[0]=="@"){ accessor = accessor.slice(1)}
      accessor = accessor.split(".")
      out.push(accessor.reduce((o,p) => o ? o[p] : null, s))
    }
    return out
  }
  let c = (old,nw) =>{
    let checks_pass = true
    let are_checks = false
    let i = 0
    for(let [accessor,...[cmp]] of args){
      if(accessor[0]=="@"){cmp = cmp || true}
      if(cmp instanceof Function){
        checks_pass &= cmp(old[i], nw[i])
        are_checks = true
      }else if(cmp){
        checks_pass &= old[i] == nw[i]
        are_checks = true
      }
      i++;
    }
    return checks_pass && are_checks
  }
  return useStore(f,c)
}



let MyZustandTest = () => {
  // let {boop1A, boop2B, setBoop1A, setBoop1B, setBoop2B} = useStore(
  //   (s) => ({boop1A : s.boop1.A, boop2B :s.boop2.B, setBoop1A : s.setBoop1A, setBoop1B : s.setBoop1B, setBoop2B: s.setBoop2B}),
  //   (o,n) => {return (o.boop1A==n.boop1A && o.boop2B==n.boop2B)}
  // )
  let [boop1A, boop2B, setBoop1A, setBoop1B, setBoop2B] = useChangedStore(
    [['@boop1.A',(old,nw)=>!(nw < 7)], '@boop2.B', 'setBoop1A', 'setBoop1B', 'setBoop2B']
  )
   
  console.log("RRR", boop1A, boop2B)
  return (
    <div>
      {`${boop1A} , ${boop2B}`}
      <div 
        style={{width:100, height:30, backgroundColor: 'red'}}
        onClick={() =>{setBoop1A(boop1A+1)}}
      >
      {"click"}
      </div>
    </div>    
  )
}

export default MyZustandTest
