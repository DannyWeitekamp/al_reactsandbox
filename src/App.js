import React, { Component, createRef, useState, useEffect, useRef, Profiler } from 'react'
import { motion, useMotionValue, useSpring, useScroll } from "framer-motion";
// import * as Animatable from 'react-native-animatable';
import autobind from "class-autobind";
import './App.css';
import './components/scrollbar.css';
import RisingDiv from "./components/RisingDiv.js"
import {CorrectnessToggler, SmallCorrectnessToggler} from "./components/CorrectnessToggler.js"
import {SkillAppGroup, DownChevron} from "./components/SkillAppCard.js"
import {Graph} from "./graph.js"
import {useStore, useChangedStore, test_state, test_skill_applications} from "./globalstate.js"
import MyZustandTest from "./rustlandTest.js"
import {shallowEqual} from "./utils.js"






function App({state, ...props}) {
  // console.log("RERENDER APP")

  const cmp_skill_apps = (o,n) =>{
    console.log(Object.keys(o), Object.keys(n), Object.keys(o) == Object.keys(n))
    return Object.keys(o) == Object.keys(n)
  }

  let [_, skill_apps, addSkillApp, removeSkillApp, setSkillApps, setStaged, incTransactionCount, setFocus] = useChangedStore(
    ["@transaction_count", "skill_apps", "addSkillApp", "removeSkillApp", "setSkillApps", "setStaged", "incTransactionCount", "setFocus"],
  )

  console.log("RERENDER APP", skill_apps)
  // OnMount
  useEffect(() =>{
    let skill_apps = test_skill_applications
    setSkillApps(skill_apps)
    incTransactionCount()
    console.log("ON MOUNT", Object.values(skill_apps)[0])
  }, [])

  state = state || test_state

  let skill_apps_by_sel = {}
  for (let [id, sa] of Object.entries(skill_apps)){
    let lst = skill_apps_by_sel?.[sa.selection] ?? []
    lst.push(sa)
    skill_apps_by_sel[sa.selection] = lst
  }

  
  

  let ref = useRef(null)

  // Make interface element overlays
  let elem_overlays = []
  for (let [sel, elem] of Object.entries(state)){
    const overlay_type = overlay_element_types[elem.type]
    elem_overlays.push(
      React.createElement(overlay_type, {
        sel:sel,
        elem: elem,
        key : "overlay_element_"+sel,
      })
    )
  }

  return (
      <div 
        ref={ref}
        onClick={(e)=>{setFocus(null)}}
        style={{
          position : "relative",
          display:'flex',
          flexDirection: 'row',
          // backgroundColor : '#eeeedc',
          width:1000,
          height:1000
      }}>
        <Profiler id="Graph" onRender={(id,phase,actualDuration)=>{
          console.log("actualDuration", actualDuration)
        }}>
          <Graph style={{width:"50%", height:"50%"}}/>
        </Profiler>

        <MyZustandTest/>
        
        {/*<div style={{position:"absolute", top:340, left:400, zIndex: 10}} >
          {skill_app_groups}
        </div>*/}
        <SkillAppCardLayer parentRef={ref} state={state} style={{position:"absolute", top:340, left:400, zIndex: 10}}/>

        <div style={{position:"absolute", top:340, left:400}} >
          {elem_overlays}
        </div>

        <div style={{position:"absolute", display:'flex',height:200, alignItems : "center",}} >
          <CorrectnessToggler style={{top:0}}/>
          <SmallCorrectnessToggler style={{top:0}}/>
        </div>
      </div>
  );
}


const images = {
  tap: require('./img/gesture-tap.png'),
  left_arrow: require('./img/arrow-left-bold.png'),
  double_chevron : require('./img/double_chevron_300x400.png')
};

const SkillAppCardLayer = ({parentRef, state, style}) => {


  let [selectionsWithSkillApps] = useChangedStore(
    [[(s) => {
      let used = []
      for (let [k,v] of Object.entries(s.sel_skill_app_ids) ){
        if(v?.length > 0){used.push(k)}
      }
      used.sort();
      return used
    },
    (o,n) => {
      return shallowEqual(o, n)
    }
    ]],
  )

  console.log(selectionsWithSkillApps)
  // Make skill application groups
  let skill_app_groups = []  
  for (let sel of selectionsWithSkillApps){
    let elem = state[sel]
    skill_app_groups.push(
      <SkillAppGroup
        sel={sel} 
        parentRef={parentRef} 
        x={elem.x+elem.width*.9} y={elem.y-20}
        key={sel+"_skill_app_group"}
    />)
  }

  return (
    <div style={{...style}} >
        {skill_app_groups}
    </div>
  )


}



function OverlayBounds({style, children, elem, color, hasFocus, hasStaged,...props}){
    return (      
      <motion.div  style= {{
        ...styles.overlay_bounds,
        ...{
          width:elem.width,
          height:elem.height,
          x : elem.x,
          y : elem.y
        },
        ...style,
        borderWidth: (hasFocus && 8) || 4,
        borderColor: color,
      }}
      {...props}
      >
        {hasStaged &&
          <img style ={styles.stage_image} src={images.double_chevron} />
        }
        {children}
      </motion.div>
  )
}

function skillAppExtractProps(skill_app){
  let correct = skill_app?.reward > 0 ?? false;
  let incorrect = skill_app?.reward < 0 ?? false;
  let isDemo = skill_app?.is_demonstration ?? false

  let color = //(isDemo && colors.demo_color) || 
              (correct && colors.correct_color) ||
              (incorrect && colors.incorrect_color) ||
              (colors.default_color)
  let input = skill_app?.input ?? ""
  return {correct, incorrect, isDemo, color, input}
}

const getOverlaySkillApp = (sel) =>{
  return [(s)=>{
      let skill_app;
      if(s?.focus_sel==sel){
        skill_app = s?.skill_apps[s.focus_id]
      }else if(s?.staged_sel==sel){
        skill_app = s?.skill_apps[s.staged_id]
      }

      if(!skill_app){
        let skill_app_ids = s.sel_skill_app_ids?.[sel]
        if(skill_app_ids?.length > 0){
          skill_app = s.skill_apps[skill_app_ids[0]]
        }
      }
      return [skill_app, s.staged_id == skill_app?.id]
    },
      ([o,os],[n,ns])=>{
        return n?.id == o?.id && n?.input == o?.input && n?.reward == o?.reward && os == ns
    }]

}

const genDemo = (sel, action_type, input) =>{
  let demo = {
    selection: sel,
    action_type : action_type,
    input : input,
    is_demonstration : true,
    reward : 1,
  } 
  return demo
}

function TextFieldOverlay({
    sel, elem,
  }) {

  const ref = useRef(null);
  const did_change = useRef(null);
  const demo_app_id = useRef(null);

  let [[skill_app, hasStaged], hasFocus, addSkillApp, removeSkillApp, setInput, setFocus] = useChangedStore(
    [getOverlaySkillApp(sel), `@focus_sel==${sel}`, "addSkillApp", "removeSkillApp", "setInput", "setFocus"],
  )

  let {correct, incorrect, isDemo, color, input} = skillAppExtractProps(skill_app)

  let text = input || ""
  let L = Math.min(text.length || 1, 8)

  let mindim = Math.min(elem.width, elem.height)
  let maxdim = Math.max(elem.width, elem.height)
  let fontSize = Math.min(mindim, maxdim/((L-1)/2 + 1))

  fontSize *= .9

  return (
    <OverlayBounds {...{elem, color, hasFocus, hasStaged}}>
      <textarea 
        className={"scrollable"}
        key={sel}
        style = {{
           ...styles.textfield,
           fontSize : fontSize,
         }}
        spellCheck="false"
        ref={ref}
        value={text}
        onFocus={(e) => {
          console.log("ON focus")
          ref.current.value=""
          if(demo_app_id.current){
            setInput(skill_app, ref.current.value)    
          }
        }}
        onBlur={(e) => {
          console.log("BLUR", demo_app_id.current, skill_app?.id)
          ref.current.value=skill_app?.input ?? ""
          if(demo_app_id.current && skill_app?.input.length==0){
            removeSkillApp(skill_app)
          }
          demo_app_id.current = null

        }}
        onChange={(e)=>{
          console.log("On CHANGE", e.target.value)
          did_change.current = ref.current.value != ""

          if(!demo_app_id.current){
            let new_skill_app = genDemo(sel, "UpdateTextField", e.target.value)
            addSkillApp(new_skill_app)
            setFocus(new_skill_app)
            
            demo_app_id.current = new_skill_app.id
          }else{
            console.log(">>", text, e.target.value)
            setInput(skill_app, e.target.value)  
          }
        }}
        onKeyPress={(evt)=>{
          if(evt.key=="Enter" && !evt.shiftKey){ ref.current.blur() }
        }}

        />
    </OverlayBounds>
  )
}

function ButtonOverlay({
    sel, elem,
  }) {

  let [[skill_app,hasStaged], hasFocus, addSkillApp, removeSkillApp, setInput, setFocus] = useChangedStore( 
    [getOverlaySkillApp(sel), `@focus_sel==${sel}`, "addSkillApp", "removeSkillApp", "setInput", "setFocus"]
  )

  let {correct, incorrect, isDemo, color, input} = skillAppExtractProps(skill_app)

  return (
    <OverlayBounds {...{elem, color, hasFocus, hasStaged}}
      onClick={(e)=>{
        console.log("BUTTON")
        if(!skill_app){
          let new_skill_app = genDemo(sel,"PressButton", -1)
          setFocus(new_skill_app)
          addSkillApp(new_skill_app)  
        }
      }}
    >
    {skill_app && 
      <img 
        style ={{...styles.button_image}}
        src={images.tap}
      />
    }
    </OverlayBounds>
  )

}


const overlay_element_types = {
  'button' : ButtonOverlay,
  'textfield' : TextFieldOverlay,
}

const colors = {
  demo_color : 'rgba(0,90,156,.7)',//'dodgerblue',
  correct_color : 'rgba(50,205,50,.7)',//'limegreen',
  incorrect_color : 'rgba(255,0,0,.7)',//'red',
  default_color : 'rgba(128,128,128,.7)',//'gray',
  focus_color : 'rgba(153,50,204,.7)',//'darkorchid',
}




const styles = {
  button_image : { 
    flex:1,
    position:'absolute',
    maxWidth :"100%",
    maxHeight :"100%",
    opacity : .7,
    pointerEvents:'none',
    userSelect: "none",
  },
  textfield : {

    display: "flex",
    textAlign:"center",
    // alignSelf: "center",
    color: 'black',//textColor || 'dodgerblue',
    width : "99%",
    height :"96%",
    backgroundColor :'transparent',
    borderColor :'transparent',
    resize: "none",
    lineHeight : "1em",
    // marginLeft : -2,
    // marginBottom : -2,


  },
  overlay_bounds: {
    display : 'flex',
    flex : 1,
    justifyContent : 'center',
    alignItems : 'center',
    position : 'absolute',
    borderStyle: "solid",//(!isDemo && color) || 'dodgerblue',//(hasFocus && "rgba(143,40,180, .7)") || "gray",
    borderRadius: 10,
    // backgroundColor : 'grey'
  },
  stage_image : {
    flex:1,
    position:'absolute',
    maxWidth:"100%",
    maxHeight:"100%",
    zIndex:-1,
    opacity:.08,
    top:"-6%",
    pointerEvents : "none",
    userSelect: "none",
  }

}


export default App;
