# ScratchEditor
Fully javascript coded tool to hack scratch. Run as a bookmarklet or whatnot.

```javascript
javascript: fetch( window.atob( "Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1pYTXVzaHJvb202My9TY3JhdGNoRWRpdG9yL21haW4vU291cmNlLmpz" ) ).then((x) => { x.blob().then((y) => { y.text().then((z) => { var script = document.createElement("script"); script.innerHTML = z; document.body.appendChild(script); }); }); }); /*/Bookmarklet/*/;
```
So far can:
<br>
Add custom blocks!!!!!!!!!!!!!!!!
<br>
Access full blockly
<br>
Modify workspace XML live
<br>
Add hidden scratch blocks
<br>
Set custom colour for all blocks.
<br>
Make all hat blocks become uwu cats.
<br>
Add a heads up display that lists how many blocks in current sprite, variables, etc.
<br>
Clear Orphan Blocks.
<br>
Clear unused local variables.
<br>
View a list of all variables with buttons to rename and delete.
<br>
View a list of all top blocks with buttons to View and delete.
<br>
And more...
<br><br>
Most bits made by Me! Please don't steal.<br>
I used ScratchAddons' code for vm and blockly trapping<br>
For <a href="https://sites.google.com/student.carey.wa.edu.au/r-store/home">rStore</a>.
