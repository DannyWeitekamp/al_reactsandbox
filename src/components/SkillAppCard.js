import React, { Component, createRef, useState, useEffect, useRef, Profiler } from 'react'
import { motion, useMotionValue, useSpring, useScroll } from "framer-motion";
// import * as Animatable from 'react-native-animatable';
import autobind from "class-autobind";
import './scrollbar.css';
import RisingDiv from "./RisingDiv.js"
import {CorrectnessToggler, SmallCorrectnessToggler} from "./CorrectnessToggler.js"

export function SkillAppGroup({x, y, parentRef, skill_apps,
  only_show_focused_index, focusCallback, staged_index,
  focus_index, style,
  ...props}) {
  const [is_hover, setIsHover] = useState(false)

  const ref = useRef(null);
  const x_anim = useMotionValue(x || 0)
  const y_anim = useMotionValue(y || 0)

  const isDragging = useRef(false);

  //Ensure that there are refs for all cards
  const cardsRef = useRef([]);
  useEffect(() => {
       cardsRef.current = cardsRef.current.slice(0, skill_apps.length);

  }, [skill_apps]);

  // Effect for focus_index change
  useEffect(() => {
    // console.log("Change", focus_index)
    if(focus_index >= 0){ref.current.focus()}
    cardsRef.current[focus_index]?.scrollIntoView({behavior:"smooth", "block" : "nearest"})
  }, [focus_index]);


  const keyDownHandler = (e) => {
    if(e.keyCode >= 49 && e.keyCode <= 58){
      let index = Math.min(parseInt(e.key)-1, skill_apps.length-1)
      // scroll_ref.current.
      // console.log(cardsRef.current)
      
      focusCallback({sel: skill_apps[0].selection, index:index})
      console.log("KEY", e.key, index)  
    }
  };

  
  const hasFocus = focus_index >= 0

  let skill_app_cards = []
  let card_refs = []
  for(let j=0; j < skill_apps.length; j++){
    // if(only_show_focused_index && j != focus_index) continue;
    let skill_app = skill_apps[j]
  // for (let skill_app of (skill_apps || [])){

    let correct = skill_app.reward > 0 || false
    let incorrect = skill_app.reward < 0 || false
    let is_demonstation = skill_app.stu_resp_type == "HINT_REQUEST"
    let staged = skill_app.is_staged || false
    let how_text = skill_app.how
    // const card_ref = useRef(null);
    
    skill_app_cards.push(
      <SkillAppCard 
       correct={correct}
       incorrect={incorrect}
       is_demonstation={is_demonstation}
       staged={staged_index==j}
       // using_default_staged={using_default_staged}
       hasFocus={focus_index==j}
       showAuxilary={hasFocus || is_hover}
       skill_app={skill_app}
       how_text={how_text}
       text={skill_app.input}
       focusCallback={focusCallback}
       sel={skill_app.selection}
       index={j}
       isDragging={isDragging}
       // toggleCallback={toggleCallback}
       // stageCallback={stageCallback}
       // removeCallback={removeCallback}
       // foci_mode={foci_mode_index==j}
       // toggleFociModeCallback={toggleFociModeCallback}
       key={j.toString()}
       innerRef={el => cardsRef.current[j] = el} 
       {...props}

      />
    )
  }




  return (
        <RisingDiv 
          innerRef={ref}
          id='keyboard'
          tabIndex="0"
          onKeyDown={keyDownHandler}
          drag
          // dragMomentum={false}
          dragConstraints={parentRef}
          //
          dragTransition={{ timeConstant: 60, power: .15}}
          onDragStart = {(e) => isDragging.current = true}
          onDragEnd = {(e) => setTimeout(()=>isDragging.current = false,100)}
          onMouseEnter={()=>setIsHover(true)}
          onMouseLeave={()=>setIsHover(false)}

          style={{
            ...styles.skill_app_group,
            x : x_anim, y : y_anim,
          }}
          {...props}
        >
          <div style = {styles.handle}>
            <div style={{transform: 'rotate(90deg)'}}>
            {String.fromCharCode(10303)} 
            </div>
          </div>
          
          <div className={"scrollable" + (hasFocus && " scrollable_focused" || "")}
                style={{
                  ...styles.skill_app_scroll_container,                  
                }}
                // onWheel={(e)=>{}}
                > 
            <motion.div 
              style={{
                ...styles.skill_app_card_area,
              }}>
              {skill_app_cards}
            </motion.div>
          </div>
          
        </RisingDiv>
    )
}

export function DownChevron({style, sep="-23%"}){
  return (
    <div style={style}>
      <div style={{position: "absolute", left: 0, top: sep}}>{"⌄"}</div>
      <div style={{position: "absolute", left: 0, top: 0}}>{"⌄"}</div>
    </div>
  )
}


export function SkillAppCard({skill_app, correct, incorrect, hasFocus, showAuxilary, staged, 
        foci_mode, stageCallback, focusCallback, toggleFociModeCallback,
        text, sel, index, is_demonstation, isDragging, style,...props}) {
  let minHeight = (hasFocus && 60) || 20
  let maxHeight = (!hasFocus && 20)
  let minWidth = 60//(hasFocus && 60) || 20
  let maxWidth = 140//(hasFocus && 140) || 40

  let bounds_color =  (is_demonstation && 'dodgerblue') ||
                        (correct && colors.c_bounds) || 
                        (incorrect && colors.i_bounds) || 
                        colors.u_bounds


  let border_style = ((hasFocus && {
                       borderStyle : 'solid',
                       padding: 0, borderWidth:4,
                       borderColor:bounds_color
                     }) ||{padding: 2, borderWidth:2}
                     )

  let right_border_color = (is_demonstation && 'dodgerblue') ||
                           (correct && colors.c_knob) || 
                           (incorrect && colors.i_knob) || 
                           colors.u_knob
  let right_border_style = (!hasFocus && {
                            borderStyle: "hidden solid hidden hidden",
                            borderRightColor:right_border_color,
                            borderRightWidth:4})
  return (
        <RisingDiv 
          onClick={(e)=>{
            console.log("<<", e)
            if(!isDragging.current){
              focusCallback?.({sel,index})}
            }}
          style={{
            ...styles.skill_app_card,
            ...border_style,
            ...right_border_style,
            // whiteSpace: "nowrap",
            minWidth:minWidth,
            maxWidth:maxWidth,
            minHeight:minHeight,
            maxHeight:maxHeight,
            }}
            {...props}
          >
          {/*Card Text*/}
          <div style={{
            ...styles.card_text,
            minWidth:minWidth,
            maxWidth:maxWidth,
          }}>
            <div>
            {text}
            </div>
          </div>

          {/*Skill Label + How*/}
          {hasFocus && 
          <div style={styles.extra_text}>
            <div style={styles.label_text}>
            {skill_app.skill_label || 'no label'}
            </div>
            <div style={styles.how_text}>
            {skill_app.how}
            </div>
          </div>
          }
            
          {/*Close Button*/}
          {is_demonstation && 
            <RisingDiv 
              style={styles.close_button}
              onPress={()=>{props.removeCallback?.()}}
            >{"✕"}</RisingDiv>
          }

          {/*Toggler*/}
          {(hasFocus &&
            <CorrectnessToggler 
              correct={correct}
              incorrect={incorrect}
              style={styles.toggler}
            />) ||
          (showAuxilary &&
            <SmallCorrectnessToggler 
              correct={correct}
              incorrect={incorrect}
              style={styles.toggler_small}
            />
          )}

          {(hasFocus &&
            <RisingDiv
              style={{
                ...styles.stage_button,
                ...(staged && styles.staged_selected),
                ...(staged && {backgroundColor : right_border_color}),
              }}
            >
            <DownChevron/>
             {/* <div style={{position: "absolute", top:"-23%"}}>{"⌄"}</div>
              <div>{"⌄"}</div>*/}
            </RisingDiv>) ||
            (staged && 
              <div style={{
                ...styles.stage_icon,
                ...(staged && {backgroundColor : right_border_color})
              }}>
              <DownChevron/>
              </div>
          )}
        </RisingDiv>
    )
}
//"✎"
//"↡"
//"↧"
//"⍖"


SkillAppCard.defaultProps = {
  // button_scale_elevation : {
  grabbed_scale : 1.035,
  focused_scale : 1.025,
  hover_scale : 1.03,
  default_scale : 1,
  hover_elevation : 4,
  default_elevation : 2
}

SkillAppGroup.defaultProps = {
  // button_scale_elevation : {
  grabbed_scale : 1.135,
  focused_scale : 1.125,
  hover_scale : 1.03,
  default_scale : 1,
  grabbed_elevation : 16,
  focused_elevation : 12,
  hover_elevation : 6,
  default_elevation : 2
}




const colors = {
  "c_bounds" : 'rgba(10,220,10,.6)',
  "i_bounds" : 'rgba(255,0,0,.6)',
  "u_bounds" : 'rgba(120,120,120,.5)',
  "c_knob" : 'limegreen',
  "i_knob" : 'red',
  "u_knob" : 'lightgray',
  "c_knob_back" : 'rgb(100,200,100)',
  "i_knob_back" : 'rgb(200,100,100)',
  "u_knob_back" : 'rgb(180,180,180)'
}

const styles = {
  handle: {
    alignSelf: "center",
    fontSize : 12,
    color: 'rgba(0,0,0,.5)',
    height : 8,
    textAlign : 'center',
    pointerEvents:'none',
    userSelect: "none",
    marginTop: -3,
    marginBottom: 3,
  },

  skill_app_background : {
    position : 'absolute',
    backgroundColor: 'rgba(80,80,120,.1)',
    borderRadius : 10,
  },
  skill_app_group : {
    position : "absolute",
    display: "flex",
    flexDirection : 'column',
    backgroundColor: 'rgba(80,80,120,.1)',
    userSelect: "none",
    borderRadius : 5,
  },

  skill_app_scroll_container : {
    position : "relative",
    display: "flex",
    flexDirection : 'column',
    maxHeight:125,
    overflowY: "scroll",
    overflowX: "clip",

    ///GOOD 
    paddingLeft : 29, 
    left : -25,
    marginRight : -31,
    //

    paddingLeft : 29, 
    left : -25,
    marginRight : -34
  },

  skill_app_card_area : {
    position : "relative",
    display: "flex",
    flex : 1,
    flexDirection : 'column',
    // alignItems: "flex-start",
    marginTop : -2,
    marginBottom : 4,
    marginRight :3,
    
    // maxHeight:100,
  },

  skill_app_card :{
    position: "relative",
    display: "flex",
    flex : 1,
    flexDirection: "column",
    marginTop:3,
    backgroundColor: "#fff",
    borderRadius : 3,
  },

  close_button: {
    position : 'absolute',
    right:2,
    top:2,
    backgroundColor : 'rgba(0,0,120,.05)',
    width: 12,
    height: 12,
    fontSize : 10,
    borderRadius: 20,
    textAlign:'center',
  },

  card_text: {
    position: "relative",
    width : "max-content",
    float : 'left',
    fontSize : 18,
    padding: 2,
    fontFamily : "Geneva",
    fontWeight: 'bold',
    overflow: "hidden",
  },

  extra_text : {
    display: 'flex',
    position : "relative",
    flex : 1,
    flexDirection : 'column',
    fontSize : 10,
    marginTop: "auto"
  },
  label_text: {
    position : "relative",
    display:'flex',
    alignSelf : 'flex-end',
    color : "gray",
    // backgroundColor : 'red',    
    fontFamily : "Geneva",
    margin:2,
    marginTop: "auto",
    textDecoration: "underline",
  },
  how_text: {
    position : "relative",
    display:'flex',
    alignSelf : 'flex-end',
    // backgroundColor : 'blue',
    fontFamily : "Geneva",
    margin:2,
    marginTop:0,
  },

  toggler: {
    position : "absolute",
    left : -24,
  },

  toggler_small: {
    position : "absolute",
    left : -22,
  },

  stage_button : {
    display : "flex",
    position: 'absolute',
    flex: 1,
    width : 10,
    height: 13,
    alignContent: "center",
    justifyContent: "center",
    fontSize : 12,
    borderRadius: 40,
    padding: 0,
    backgroundColor: 'rgba(190,190,190,.8)',
    left : -6,
    bottom : -6,
    // fontWeight: 'bold',
  },

  stage_icon : {
    display : "flex",
    position : "absolute",
    width : 7,
    height : 8,
    fontSize : 9,
    top: null,
    alignContent: "center",
    justifyContent: "center",
    left:-2,
    bottom: -2,
    paddingBottom:3,
    borderRadius: 10,
    backgroundColor: colors.c_bounds//"limegreen"//'dodgerblue',

    // fontWeight: 'bold',
  },
  foci_button: {
    position: 'absolute',
    bottom : 4,
    left : 4,
    flex: 1,
    width :20,
    height :20,
    borderRadius: 20,
    backgroundColor: 'rgba(120,120,120,.2)'
  },

  
  staged_selected:{
    backgroundColor: colors.c_bounds,//"limegreen",
  },

  
}
