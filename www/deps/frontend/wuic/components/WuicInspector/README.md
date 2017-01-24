1.INSPECTOR OBJECT
==================
when an Inspector object is instantiated, it will go thru all views registred in viewManager
and make a snapshoot of all Sprites appended in the project (the sprite tree)
and an Dom interface is created (the Inspector Window) in the HTML document.

2.THE INSPECTOR WINDOW
======================
the Inspector window interface is as follow :

 +--------------+--------------+--------------------+
 |  1.handle    |              |                    |
 +--------------|   4.menu     |--------------------+
 |              |              |                    |
 | 2.browser    +--------+-----+     3.editor       |
 |                       |                          |
 |                       |                          |
 +-----------------------+--------------------------+


2.1.HANDLE
==========
Swipe on handle will move the Inspector window in the HTML page.
Clic on handle viewport will display the menu view port (hidden by default).


2.2.BROWSER
===========
Sprite tree is displayed in browser viewport.
If sprite has a name, browser will display it otherwise use the class name.
For example a project would be displayed as following :

  █ viewName1     <-------------- view
  |+Sprite        <-------------- an object Sprite without name, with children (folded)
  |+Sprite        <-------------- expanded entry
  | |+BitmapText
  |-cloud         <-------------- an object named 'cloud'
  █ viewName2
  |+container
  |+Sprite


Views (roots of Sprite Tree) are displayed with a '█' in front of their name
Sprite that have children are displayed with a '+' in front of their name
Leaf of Sprite Tree are displayed with a '-' in front of their name

Clic on a '█' or '+' will expand / fold the sprite's direct children in the browser.
This can also be achieve with a double clic on the Sprite selection

Clic on the Sprite selection will select / unselect the sprite.
A selected sprite will be highlighted in color, and a bounding box will be displayed
on the canvas with the same color.

2.3 EDITOR
==========
The editor viewport display the sprite value of the last selection. the values displayed are :

   --------+----------+-------------------------------------------------
   POS     | x        | y
   SIZE    | width    | height
   PIVOT   | pivotX   | pivotY
   SCALE   | scaleX   | scaleY
   SKEW    | skewX    | skewY
   ROT     | rotation | rotation in degree
   ALPHA   | alpha    |
   VISIBLE | _visible | computed visibility (regarding parents)
   ENABLED | __enable | computed enability (regarding parents)
   --------+------------------------------------------------------------
   RELATIVE| relative coordinate of the canvas origin point projected in the Sprite transformation space
   PARENT  | coordinate of the sprite parent
   --------+------------------------------------------------------------

Selected Sprites can be modified in this view port. roll over the property to modify and
scroll the mouse wheel to increment / decrement the value. All selected sprites will be modified.
Clic on the propery field will open a text field where we can type value. You can also type an
expression in a property field if the expression return a numeric value.
All selected sprite will be modified.

2.4 MENU
========
clic on the handle to display menu. The folowing actions can be executed :
- refresh Sprite Tree : Make a fresh snapshoot the Sprite Tree of the project.
- expand all          : Expand all entries in the inspector browser.
- expand selection    : Expand all children of selected entries
- fold all            : Fold all entries in inspector browser, showing only the views of the project.
- select children     : The direct children of the current selection will be selected.
- deselect all        : Remove all selection.
- log sprite          : Make a console.log of the last selected sprite (sprite shown in editor viewport).
- small interface     : Reduce inspector window to a small size.
- big interface       : Enlarge inspector window to a big size.
- browser only        : Hide editor viewport, and set same browser size as the big interface
- minimize Inspector  : Reduce inspector window to only a small handle (configuration at startup)