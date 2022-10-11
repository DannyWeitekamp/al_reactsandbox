import create from "zustand";
import {randomID} from "./utils.js";

const test_state = {
  "A" : {
    id: "A",
    type : "textfield",
    x : 100,
    y : 100,
    width: 200,
    height: 100,
  },
  "B" : {
    id: "B",
    type : "textfield",
    x : 200,
    y : 250,
    width: 200,
    height: 200,
  },
  "C" : {
    id: "C",
    type : "textfield",
    x : 350,
    y : 100,
    width: 100,
    height: 100,
  },
  "D" : {
    id: "D",
    type : "textfield",
    x : 50,
    y : 300,
    width: 100,
    height: 100,
  },
  "Button" : {
    id: "Button",
    type : "button",
    x : 150,
    y : 500,
    width: 100,
    height: 50,
  },
  "E" : {
    id: "E",
    type : "textfield",
    x : 500,
    y : 300,
    width: 100,
    height: 100,
  },
  "F" : {
    id: "F",
    type : "textfield",
    x : 650,
    y : 300,
    width: 100,
    height: 100,
  },
  "G" : {
    id: "G",
    type : "textfield",
    x : 500,
    y : 500,
    width: 100,
    height: 100,
  },
}

const test_skill_applications = [
        {"selection" : "A", "action" : "UpdateTextField", "input" : "6",
          "how": "Add(?,?,?) ","reward": -1, only: false},

        { "selection" : "B", "action" : "UpdateTextField", "input" : "long long long long long long long long sdf sdf sjif sd",
          "how": "Add(?,?,?)", "reward": -1},
        { "selection" : "B", "action" : "UpdateTextField", "input" : "8x + 4 + 7 + 9 + 2+6+5",
          "how": "x0 + x1 + x2", "reward": 1,
          foci_of_attention: ["E","F"]},
        { "selection" : "B", "action" : "UpdateTextField", "input" : "9",
          "how": "Add(?,?,?)", "reward": 0},
        { "selection" : "B", "action" : "UpdateTextField", "input" : "5",
          "how": "Add(?,?,?)", "reward": 0},
        { "selection" : "B", "action" : "UpdateTextField", "input" : "12",
          "how": "Add(?,?,?)", "reward": 0},
        { "selection" : "B", "action" : "UpdateTextField", "input" : "16x - 8",
          "how": "Subtract(?,Add(?,?))", "reward": 1},

        { "selection" : "C", "action" : "UpdateTextField", "input" : "8x + 4",
          "how": "x0 + x1 + x2", "reward": 1,
          foci_of_attention: ["E","F"]},
        { "selection" : "C", "action" : "UpdateTextField", "input" : "9",
          "how": "Add(?,Subtract(?,?,?),?, Subtract(?,?,?))", "reward": -1},
        { "selection" : "C", "action" : "UpdateTextField", "input" : "5",
          "how": "Add(?,?,?)", "reward": -1},
        { "selection" : "C", "action" : "UpdateTextField", "input" : "12",
          "how": "Add(?,?,?)", "reward": -1},
        { "selection" : "C", "action" : "UpdateTextField", "input" : "16x - 8",
          "how": "Subtract(?,Add(?,?))", "reward": 1},

        // { "selection" : "Button", "action" : "PressButton", "input" : "-1",
        //   "how": "-1", "reward": -1},
]

for(let sa of test_skill_applications){
  sa.id = randomID()
}


const removeKey = (key, {[key]: _, ...rest}) => rest;

const setSkillAppAttr = (state, skill_app, attr, val) => {
  return {skill_apps : {
        ...state.skill_apps,
        [skill_app.id] : {...state.skill_apps[skill_app.id], [attr]:val}
  }}
}

const makeOnlyChanges = (state, skill_app, only) => {
  let old = state.skill_apps[skill_app.id].only ?? false
  let changes = setSkillAppAttr(state, skill_app, 'only', only)
  if(old != only){
    let only_count = changes['only_count'] = state.only_count+(only-old)
    console.log("-------", changes['only_count'], (only-old), only, old)
  }
  return changes
}

const findStageCandidate = (state) =>{

}


const makeUndoStagedChanges = (state) => {
  let stack = state.stage_undo_stack
  let changes = {staged_id: "", staged_sel:"", stage_undo_stack:[]}
  let okay = false
  while(stack.length > 0){

    changes = {...stack.pop(), stage_undo_stack:stack}
    if(state.skill_apps[changes.staged_id].reward > 0){
      okay = true
      break
    }
  }
  if(!okay){
    console.log("STACK EXHAUSTED")
    for(let skill_app of Object.values(state.skill_apps)){
      if(skill_app.reward > 0){
        console.log("+++", skill_app.input)
        changes = {staged_id: skill_app.id, staged_sel:skill_app.selection, stage_undo_stack:[]}
        break
      }
    }
  }
  console.log("STAGE CHANGES", changes)
  return changes
}

const useStore = create((set,get) => ({
  transaction_count : 0, 
  skill_apps: {},
  sel_skill_app_ids: {},
  focus_id : "",
  focus_sel : "",
  hover_id : "",
  hover_sel : "",
  staged_id : "",
  staged_sel : "",
  stage_undo_stack : [],
  only_count : 0,




  /*** Controls ***/

  setFocus: (skill_app) => set((state) => { 
    return {focus_sel : skill_app?.selection ?? "", focus_id : skill_app?.id ?? ""}
  }),

  setHover: ({sel,id}) => set((state) => {
    return {hover_sel : sel ?? state.hover_sel , hover_id : id ?? state.hover_id}     
  }),

  setStaged: (skill_app, store_prev=true) => set((state) => { 
    let changes = {staged_sel : skill_app.selection, staged_id : skill_app.id}
    if(store_prev && state.staged_id != ""){
      changes['stage_undo_stack'] = [...state.stage_undo_stack, {staged_id: state.staged_id, staged_sel : state.staged_sel}]
    }
    return changes
  }),

  undoStaged: () => set((state) => (
    makeUndoStagedChanges(state)
  )),

  incTransactionCount: (skill_app) => set((state) => { 
    return {transaction_count : state.transaction_count + 1}
  }),



  /*** Adding + Removing Skill Applications ***/

  addSkillApp: (skill_app) => set((state) => { 
    let sel = skill_app.selection
    skill_app.id = skill_app.id || randomID()
    return {
      sel_skill_app_ids : {
      ...state.sel_skill_app_ids,
      [sel] : [skill_app.id, ...(state.sel_skill_app_ids[sel]||[])]
      },
      skill_apps: {
        ...state.skill_apps,
        [`${skill_app.id}`] : skill_app,
      },
      only_count : state.only_count + (skill_app?.only || 0)
    }
  }),
  removeSkillApp: (skill_app) => set((state) => {
    let sel = skill_app.selection
    console.log(sel, state.sel_skill_app_ids[sel])
    console.log(skill_app.id)
    console.log("%%", state.sel_skill_app_ids[sel].filter((x)=>x!=skill_app.id))
    return {
      skill_apps: removeKey(skill_app.id, state.skill_apps),
      sel_skill_app_ids : {
        ...state.sel_skill_app_ids,
        [sel] : state.sel_skill_app_ids[sel].filter((x)=>x!=skill_app.id)
      },
      only_count : state.only_count - (skill_app?.only || 0)
    }
  }),
  setSkillApps: (skill_apps) => set((state) => {
    let skill_apps_by_sel = {}
    let _skill_apps = {}
    let staged = {staged_id: "", staged_sel : "", stage_undo_stack: []}

    // Make skill_apps and sel_skill_app_ids
    for (let sa of Object.values(skill_apps)){
      let lst = skill_apps_by_sel?.[sa.selection] ?? []
      lst.push(sa.id)
      skill_apps_by_sel[sa.selection] = lst
      _skill_apps[sa.id] = sa

      //Ensure that we stage a skill app if it came with reward > 0
      if(staged.staged_id == "" && sa.reward > 0){
        staged.staged_id = sa.id
        staged.staged_sel = sa.sel
      }
    }
    let changes = {
        skill_apps: _skill_apps,
        sel_skill_app_ids: skill_apps_by_sel,
        ...staged
    }
    return changes
  }),

  /*** Modifying Skill Applications ***/

  setReward : (skill_app, reward) => set((state) => {
    let changes = setSkillAppAttr(state, skill_app,'reward', reward)
    // console.log("SET REW", state.skill_apps[skill_app.id])
    if(skill_app.reward >= 0 && reward < 0){
      changes = makeOnlyChanges({...state,...changes}, state.skill_apps[skill_app.id], false)
      if(skill_app.id == state.staged_id){
        changes = {...changes, ...makeUndoStagedChanges({...state,...changes})}
      }
    }else if(skill_app.reward <= 0 && reward > 0 && state.staged_id == ""){
      changes = {...changes, ...makeUndoStagedChanges({...state,...changes})}
    }
    console.log("SET REW", changes)
    return changes
  }),

  setInput : (skill_app, input) => set((state) => (
    setSkillAppAttr(state, skill_app,'input', input)
  )),

  setSkillLabel : (skill_app, skill_label) => set((state) => (
    setSkillAppAttr(state, skill_app,'skill_label', skill_label)
  )),

  setHowPart : (skill_app, how_part) => set((state) => (
    setSkillAppAttr(state, skill_app,'how_part', how_part)
  )),

  setOnly: (skill_app, only) => set((state) => (
    makeOnlyChanges(state, skill_app, only)
  )),

}));

/*Implements useChangedStore hook
   Takes a list of accessors strings like for example "@object.child.id"
   where presence of "@" indicates that the accessed value should be checked 
   for a change before rerendering. In the absence of an "@" decorated accessor,
   no checks are made. Optionally a custom check like (old,new) =>{whatever}
   can be provided [["object.child.id", (old,new) =>{whatever}],...]
*/
const useChangedStore = (args, do_update=true) =>{
  args = args.map((x)=>Array.isArray(x) ? x : [x])
  let accessors = args.map(([accessor,...[cmp]])=>{
    if(!(accessor instanceof Function)){
      if(accessor[0]=="@"){ accessor = accessor.slice(1)}
      if(accessor.includes("==")){
        let [a,val] = accessor.split("==")
        a = a.split(".")
        return (s) => (a.reduce((o,p) => o ? o[p] : null, s) == val)
      }
      if(accessor.includes("!=")){
        let [a,val] = accessor.split("!=")
        a = a.split(".")
        return (s) => (a.reduce((o,p) => o ? o[p] : null, s) != val)
      }
      return accessor.split(".")
    }else{
      return accessor
    }
    
  })
  let f = (s) =>{
    let out = []
    for(let accessor of accessors){
      if(accessor instanceof Function){

        out.push(accessor(s))
      }else{
        out.push(accessor.reduce((o,p) => o ? o[p] : null, s))
      }
    }
    return out
  }
  let c
  if(do_update){
    let cmps = args.map(([accessor,...[cmp]])=>cmp || accessor[0]=="@")
    c = (old,nw) =>{
      let checks_pass = true
      let are_checks = false
      let i = 0
      for(let cmp of cmps){
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
  }else{
    c = () => true
  }  
  return useStore(f,c)
}

export {useStore, useChangedStore, test_state, test_skill_applications};
