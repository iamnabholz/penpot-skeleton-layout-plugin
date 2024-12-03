import { Group, Board, Shape } from "@penpot/plugin-types";

penpot.ui.open("Skeleton Layout", `?theme=${penpot.theme}`, {
  width: 240,
  height: 305,
});

let keepText: Boolean = false;

const createSkeleton = (element: Shape, toRemove: Boolean = true) => {
  const skeleton = penpot.createRectangle();
  skeleton.borderRadius = element.borderRadius || 12;
  skeleton.x = element.x;
  skeleton.y = element.y;
  skeleton.resize(element.width, element.height);
  skeleton.fills = [{ fillOpacity: 0.6, fillColor: "#aeabab" }];

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
        child.fills = [{ fillOpacity: 1, fillColor: "#aeabab" }];
      } else {
        const skeletonChild = createSkeleton(child);
        element.insertChild(children.length, skeletonChild);
      }
    } else if (
      penpot.utils.types.isRectangle(child) ||
      penpot.utils.types.isEllipse(child) ||
      penpot.utils.types.isPath(child)
    ) {
      child.fills = [{ fillOpacity: 0.6, fillColor: "#aeabab" }];
    } else if (penpot.utils.types.isGroup(child)) {
      iterateChildren(child);
    } else if (penpot.utils.types.isBoard(child)) {
      const skeletonChild = createSkeleton(child, false);
      const group = penpot.group([...child.children, skeletonChild]);

      if (group) {
        element.insertChild(children.length, group);
        iterateChildren(group);
        child.remove();
      }
    }
  });
};

penpot.ui.onMessage<any>((message) => {
  if (message.msg === "transform") {
    keepText = message.value;
    const selection = penpot.selection;

    selection.forEach((board) => {
      if (penpot.utils.types.isBoard(board)) {
        iterateChildren(board);
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
