import { Group, Board, Shape } from "@penpot/plugin-types";

penpot.ui.open("Skeleton Layout", `?theme=${penpot.theme}`, {
  width: 240,
  height: 260,
});

const createSkeleton = (element: Shape, parent: Board | Group) => {
  const skeleton = penpot.createRectangle();
  skeleton.borderRadius = 12;
  skeleton.x = element.x;
  skeleton.y = element.y;
  skeleton.resize(element.width, element.height);
  skeleton.fills = [{ fillOpacity: 0.6, fillColor: "#aeabab" }];

  skeleton.name = element.name;

  element.remove();

  parent.insertChild(parent.children.length, skeleton);
}

const iterateChildren = (element: Group | Board) => {
  const children = [...element.children];

  children.forEach((child) => {
    if (penpot.utils.types.isText(child)) {
      child.growType = "auto-width";
      createSkeleton(child, element);
    } else if (penpot.utils.types.isRectangle(child) || penpot.utils.types.isEllipse(child) || penpot.utils.types.isPath(child)) {
      child.fills = [{ fillOpacity: 0.6, fillColor: "#aeabab" }];
    } else if (penpot.utils.types.isGroup(child) /*|| penpot.utils.types.isBoard(child)*/) {
      iterateChildren(child);
    } else if (penpot.utils.types.isBoard(child)) {
      const grouped = penpot.group(child.children);
      if (grouped) {
        element.insertChild(element.children.length, grouped);
        iterateChildren(grouped);
        child.remove();
      }
    }
  });
}

penpot.ui.onMessage<string>((message) => {
  if (message === "create-text") {
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
