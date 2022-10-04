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
import useStore, {test_state} from "./globalstate.js"
import MyZustandTest from "./rustlandTest.js"






function App({state, ...props}) {
  let [skill_apps, addSkillApp, removeSkillApp] = useStore((state) => [state.skill_apps, state.addSkillApp, state.removeSkillApp]);


  // let [skill_apps, setSkillApps] = useState(props.skill_apps || test_skill_applications)
  state = state || test_state

  let skill_apps_by_sel = {}
  for (let [id, sa] of Object.entries(skill_apps)){
    let lst = skill_apps_by_sel?.[sa.selection] ?? []
    lst.push(sa)
    skill_apps_by_sel[sa.selection] = lst
  }

  let ref = useRef(null)
  

  let demoCallback = (skill_app) =>{
    addSkillApp(skill_app)
  }

  let [focus, setFocus] = useState({"sel" : "C", "index" : 1})
  let [staged, setStaged] = useState({"sel" : "C", "index" : 1})

  // Make skill application groups
  let skill_app_groups = []  
  for (let [sel, skill_apps] of Object.entries(skill_apps_by_sel)){
    let elem = state[sel]
    skill_app_groups.push(
      <SkillAppGroup
        parentRef={ref} 
        x={elem.x+elem.width*.9}
        y={elem.y-20}
        sel={sel} 
        focus_index={focus.sel==sel ? focus.index : -1}
        staged_index={staged.sel==sel ? staged.index : -1}
        skill_apps={skill_apps}
        key={"card"+sel}
        focusCallback={setFocus}
    />)
  }

  

  // Make interface element overlays
  let elem_overlays = []
  for (let [sel, elem] of Object.entries(state)){
    let showing_index = focus.sel==sel ? focus.index : 0
    let sa = skill_apps_by_sel[sel]?.[showing_index] 
    let isStaged = staged.sel==sel;
    let hasFocus = focus.sel==sel;
    const overlay_type = overlay_element_types[elem.type]
    elem_overlays.push(
      React.createElement(overlay_type, {
        skill_app: sa,
        elem: elem,
        isStaged : isStaged,
        hasFocus : hasFocus,
        isFociMode : false,
        isFociSelected : false,
        key : "proposal"+sel,
        demoCallback : demoCallback
      })
    )
  }

  return (
      <div 
        ref={ref}

        style={{
          position : "relative",
          display:'flex',
          flexDirection: 'row',
          // justifyContent : "center",
          // alignItems : "center",
          backgroundColor : '#eeeedc',
          width:1000,
          height:1000
      }}>
        <Profiler id="Graph" onRender={(id,phase,actualDuration)=>{
          console.log("actualDuration", actualDuration)
        }}>
          <Graph style={{width:"50%", height:"50%"}}/>
        </Profiler>

        <MyZustandTest/>
        
        <div style={{position:"absolute", top:340, left:400, zIndex: 10}} >
          {skill_app_groups}
        </div>

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



function OverlayBounds({style, children, elem, color, hasFocus, isStaged}){
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
        borderColor: color,//(hasFocus && "rgba(143,40,180, .7)") || "gray",
      }}>
        {isStaged &&
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

  let color = (correct && colors.correct_color) ||
              (incorrect && colors.incorrect_color) ||
              (colors.default_color)
  let input = skill_app?.input ?? ""
  return {correct, incorrect, isDemo, color, input}
}

function TextFieldOverlay({
    skill_app, elem, isStaged, hasFocus,
    demoCallback}) {

  let {correct, incorrect, isDemo, color, input} = skillAppExtractProps(skill_app)


  let text = input
  let L = (text.length || 1)

  //Remember the value before we gained focus so it can be restored
  // if no change 
  const prevText = useRef(null);
  const ref = useRef(null);
  const did_change = useRef(null);

  const [textLen, setTextLen] = useState(Math.min(L,8)||1)

  useEffect(() =>{
    ref.current.value = text
    prevText.current = text
    did_change.current = false
  }, [])

  L = Math.max(textLen,1)
  let mindim = Math.min(elem.width, elem.height)
  let maxdim = Math.max(elem.width, elem.height)
  let fontSize = Math.min(mindim, maxdim/((L-1)/2 + 1))

  fontSize *= .9

  return (
    <OverlayBounds {...{elem, color, hasFocus, isStaged}}>
      <textarea 
        className={"scrollable"}
        style = {{
           ...styles.textfield,
           fontSize : fontSize,
           // color: color,
         }}
          type="text"
          spellCheck="false"
          ref={ref}
          onFocus={(e) => {
            ref.current.value=""
            did_change.current=false
            setTextLen(1)
          }}
          onBlur={(e) => {
            if(did_change.current){
              console.log("DEMO", ref.current.value)
              prevText.current = ref.current.value
              let new_skill_app = {
                selection: skill_app.selection,
                action_type : "UpdateTextField",
                input : ref.current.value,
                is_demonstration : true,
                reward : 1,
              }
              demoCallback(new_skill_app)
              // submitDemoCallback?.()  
            }
            e.target.value = prevText.current
            setTextLen(Math.min(prevText.current.length,8))
          }}
          onChange={(evt)=>{
            did_change.current = ref.current.value != ""
            let new_len = Math.min(ref.current.value.length,8) 
            if(new_len != textLen){ setTextLen(new_len)}
          }}
          onKeyPress={(evt)=>{
            if(evt.key=="Enter" && !evt.shiftKey){ ref.current.blur() }
          }}
        />
    </OverlayBounds>
  )
}

function ButtonOverlay({
    skill_app, elem,
    color, isDemo, isStaged, hasFocus,
    submitDemoCallback}) {
  return (
    <OverlayBounds {...{elem, color, hasFocus, isStaged}}>
      <img 
        style ={{...styles.button_image}}
        src={images.tap} 
      />
    </OverlayBounds>
  )

}


const overlay_element_types = {
  'button' : ButtonOverlay,
  'textfield' : TextFieldOverlay,
}

const colors = {
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
