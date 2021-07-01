import {getCurrentToken, getWeaponRanges} from "./utility.js";
import {keyboard} from "./keyboard.js";
import {TokenInfo} from "./tokenInfo.js";
import * as Settings from "./settings.js";

const MOVEMENT_PLANNER_BUTTON = "movementPlannerButton";

async function _submitDialog(i, html) {
  // console.log("_submitDialog", i, html);
  await TokenInfo.current.setWeaponRange(i);
}

async function _movementPlannerClick(toggled, controls) {
  let isActive = Settings.isActive()

  if (keyboard.isDown("Shift")) {  // Pop quick settings
    let token = getCurrentToken();
    if (!token) {
      ui.notifications.warn("Can't open quick settings without a selected token");
    } else {
      // Assume we want to activate if the user is opening the dialog
      isActive = true;

      let buttons = Object.fromEntries(getWeaponRanges().map((i) => [i, {label: i, callback: (html) => _submitDialog(i, html)}]));

      let d = new Dialog({
        title: "Movement Planner Quick Settings",
        content: "<p>Weapon Range:</p>",
        buttons
      }, {id: "movementPlannerDialog"});
      d.render(true);
    }
  } else if (keyboard.isDown("Control")) { // Reset measureFrom
    let token = getCurrentToken();
    if (!token) {
      ui.notifications.warn("Can't reset token measureFrom without a selected token");
    } else {
      TokenInfo.current.updateMeasureFrom();
      globalThis.movementPlanner.instance.fullRefresh();
    }
  } else {
    isActive = toggled;
  }

  // Ensure button matches active state
  // We _must_ set .active _before_ using await or the button will be drawn and we'll be too late
  controls.find(group => group.name === "token").tools.find(t => t.name === MOVEMENT_PLANNER_BUTTON).active = isActive;
  await Settings.setActive(isActive);
}

let movementPlannerButton;
Hooks.on('getSceneControlButtons', (controls) => {
  if (!movementPlannerButton) {
    movementPlannerButton = {
      name: MOVEMENT_PLANNER_BUTTON,
      title: "movement-planner.controlButton",
      icon: "fas fa-people-arrows",
      toggle: true,
      active: Settings.isActive(),
      onClick: (toggled) => _movementPlannerClick(toggled, controls),
      visible: true,  // TODO: Figure out how to disable this from Settings
    }
  }

  const tokenControls = controls.find(group => group.name === "token").tools
  tokenControls.push(movementPlannerButton);
});