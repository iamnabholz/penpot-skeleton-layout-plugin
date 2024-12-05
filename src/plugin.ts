import { Group, Board, Shape } from "@penpot/plugin-types";

penpot.ui.open("Skeleton Layout", `?theme=${penpot.theme}`, {
  width: 260,
  height: 320,
});

let keepText: Boolean = false;

const skeletonFill = [{ fillOpacity: 0.55, fillColor: "#cfcfcf" }];

const createSkeleton = (element: Shape, toRemove: Boolean = true) => {
  const skeleton = penpot.createRectangle();

  let borderRadius = element.borderRadius !== null ? element.borderRadius : 12;
  if (penpot.utils.types.isBoard(element) && element.borderRadius === null) {
    borderRadius = 0;
  }

  skeleton.borderRadius = borderRadius;
  skeleton.x = element.x;
  skeleton.y = element.y;
  skeleton.resize(element.width, element.height);
  skeleton.fills = skeletonFill;

  skeleton.name = element.name;

  if (toRemove) {
    element.remove();
  }

  return skeleton;
};

const iterateChildren = (element: Group | Board) => {
  const children = [...element.children];

  children.forEach((child) => {
    if (penpot.utils.types.isText(child)) {
      //child.growType = "auto-width";
      if (keepText) {
        child.fills = [{ fillOpacity: 1, fillColor: "#cfcfcf" }];
      } else {
        const skeletonChild = createSkeleton(child);
        element.insertChild(children.length, skeletonChild);
      }
    } else if (
      penpot.utils.types.isRectangle(child) ||
      penpot.utils.types.isEllipse(child) ||
      penpot.utils.types.isPath(child)
    ) {
      child.fills = skeletonFill;
    } else if (penpot.utils.types.isGroup(child)) {
      iterateChildren(child);
    } else if (penpot.utils.types.isBoard(child)) {
      const hasFills = child.fills.length > 0 ? true : false;

      if (hasFills) {
        const skeletonChild = createSkeleton(child, false);
        const group = penpot.group([skeletonChild, ...child.children]);

        if (group) {
          element.insertChild(children.length, group);
          iterateChildren(group);
          child.remove();
        }
      } else {
        const group = penpot.group([...child.children]);

        if (group) {
          element.insertChild(children.length, group);
          iterateChildren(group);
          child.remove();
        }
      }
    }
  });
};

penpot.ui.onMessage<any>((message) => {
  if (message.msg === "transform") {
    keepText = message.value;
    const selection = penpot.selection;

    selection.forEach((element) => {
      if (
        penpot.utils.types.isBoard(element) ||
        penpot.utils.types.isGroup(element)
      ) {
        // TODO: if board is not a root element (doesn't have a parent) it means we are dealing with a flex or grid layout, we should handle background accorddingly
        iterateChildren(element);
      }
    });
  }
});

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});
