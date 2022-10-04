import create from "zustand";
import {randomID} from "./utils.js";

export const test_state = {
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
          "how": "Add(?,?,?) ","reward": -1, is_staged: true},

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
]

for(let sa of test_skill_applications){
  sa.id = randomID()
}


const removeKey = (key, {[key]: _, ...rest}) => rest;

const useStore = create((set) => ({
  skill_apps: test_skill_applications,
  focus_sel: "",
  focus_index: 0,
  hover_sel: "",
  hover_index: 0,


  addSkillApp: (skill_app) =>
    set((state) => ({ 
      skill_apps: {
        [`${skill_app.id}`] : {id : skill_app.id || randomID(), ...skill_app},
         ...state.skill_apps} 
    })),
  removeSkillApp: (id) =>
   set((state) => ({
     skill_apps: removeKey(id, state.skill_apps)
   })),
  setSkillApps: (skill_apps) =>
   set((state) => ({
     skill_apps: {...skill_apps}
   })),
  setReward : (id) =>{
  	set((state) => state.skill_apps[id].reward )

  }
  
}));

export default useStore;
