/*:
* @plugindesc Makes it so that the default name-input screen works well
with just about any font.
@author CG-Tespy – https://github.com/CG-Tespy
* @help This is version 1.00.03 of this plugin. The params are to help
* make things friendlier for whatever font you want to use for the game,
* though the defaults are probably good enough for most cases.
*
* Tested for compatibility with these plugins:
* - SumRndmDude's Name Input Upgrade (SRD_NameInputUpgrade)
*
* Credit is appreciated, but not required.
* 
* @param Underline
*
* @param UnderlineWidth
* @parent Underline
* @type number
* @default 260
* @desc Default: 260
*
* @param UnderlineHeight
* @parent Underline
* @type number
* @default 3
* @desc Default: 3
*
* @param UnderlineXOffset
* @parent Underline
* @type number
* @default -35
* @min -99999999
* @desc Default: -35
*
* @param UnderlineYOffset
* @parent Underline
* @type number
* @default 0
* @min -99999999
* @desc Default: 0
*
* @param NameText
*
* @param NameXOffset
* @parent NameText
* @type number
* @default -20
* @min -99999999
* @desc Relative to where the name would normally be drawn. Default: -20
*
* @param NameYOffset
* @parent NameText
* @type number
* @default 0
* @min -99999999
* @desc Relative to where the name would normally be drawn. Default: 0
*
* @param Letter-CountDisplay
*
* @param LCLabel
* @parent Letter-CountDisplay
* @type string
* @default ~Letters~
*
* @param ShowLCLabel
* @parent Letter-CountDisplay
* @type boolean
* @default true
* @desc Whether or not the LCLabel should show. Default: true
*
* @param LCLabelXOffset
* @parent Letter-CountDisplay
* @type number
* @default 0
* @min -99999999
* @desc This is relative to the position of the underline. Default: 0
*
* @param LCLabelYOffset
* @parent Letter-CountDisplay
* @type number
* @default -85
* @min -99999999
* @desc This is relative to the position of the underline. Lower number means higher up. Default: -85
*
* @param LCLabelAlignment
* @parent Letter-CountDisplay
* @type select
* @option left
* @option center
* @option right
* @default center
*
* @param CursorWidth
* @type number
* @default 3
* @desc Default: 3
*
*/

(function()
{
    DoSomePrepWork();
    
    function DoSomePrepWork()
    {
        window.CGT = window.CGT || {};

        var NaInFoFi = 
        {
            defaultUnderlineWidth: 225,
            defaultUnderlineHeight: 3,

            defaultUnderlineXOffset: 0,
            defaultUnderlineYOffset: 0,

            defaultNameXOffset: 15,
            defaultNameYOffset: 0,

            defaultCursorWidth: 3,

            defaultLCLabel: "Letters",
            defaultShowLCLabel: true,
            defaultLCLabelXOffset: 0,
            defaultLCLabelYOffset: -85,

            defaultLCLabelAlignment: "center",

            Params: 
            {
                UnderlineWidth: 250,
                UnderlineHeight: 3,
                CursorWidth: 3,
            },
        };

        NaInFoFi.Params = GetParams();

        function GetParams()
        {
            var pluginName = "CGT_NameInputFontFix_MV";
            var rawParams = PluginManager.parameters(pluginName);
            var paramNames = 
            {
                UnderlineWidth: "UnderlineWidth",
                UnderlineHeight: "UnderlineHeight",

                UnderlineXOffset: "UnderlineXOffset",
                UnderlineYOffset: "UnderlineYOffset",

                NameXOffset: "NameXOffset",
                NameYOffset: "NameYOffset",

                CursorWidth: "CursorWidth",

                LCLabel: "LCLabel",
                ShowLCLabel: "ShowLCLabel",
                LCLabelXOffset: "LCLabelXOffset",
                LCLabelYOffset: "LCLabelYOffset",

                LCLabelAlignment: "LCLabelAlignment"
            };
    
            var parsedParams = 
            {
                UnderlineWidth: Number(rawParams[paramNames.UnderlineWidth]) || 
                NaInFoFi.defaultUnderlineWidth,
    
                UnderlineHeight: Number(rawParams[paramNames.UnderlineHeight]) ||
                NaInFoFi.defaultUnderlineHeight,

                UnderlineXOffset: Number(rawParams[paramNames.UnderlineXOffset]) ||
                NaInFoFi.defaultUnderlineXOffset,

                UnderlineYOffset: Number(rawParams[paramNames.UnderlineYOffset]) ||
                NaInFoFi.defaultUnderlineYOffset,

                NameXOffset: Number(rawParams[paramNames.NameXOffset]) ||
                NaInFoFi.defaultNameXOffset,

                NameYOffset: Number(rawParams[paramNames.NameYOffset]) ||
                NaInFoFi.defaultNameYOffset,
    
                CursorWidth: Number(rawParams[paramNames.CursorWidth]) ||
                NaInFoFi.defaultCursorWidth,

                LCLabel: rawParams[paramNames.LCLabel] || NaInFoFi.defaultLCLabel,

                ShowLCLabel: rawParams[paramNames.ShowLCLabel] == "true",

                LCLabelXOffset: Number(rawParams[paramNames.LCLabelXOffset]) || 
                NaInFoFi.defaultLCLabelXOffset,

                LCLabelYOffset: Number(rawParams[paramNames.LCLabelYOffset]) ||
                NaInFoFi.defaultLCLabelYOffset,

                LCLabelAlignment: rawParams[paramNames.LCLabelAlignment] ||
                NaInFoFi.defaultLCLabelAlignment

            };
    
            return parsedParams;
        }

        window.CGT.NaInFoFi = NaInFoFi;
    }
    
    ChangeHowThingsAreDrawn();

    function ChangeHowThingsAreDrawn()
    {
        var oldRefresh = Window_NameEdit.prototype.refresh;

        function NewRefresh()
        {
            oldRefresh.call(this);

            UpdateRects.call(this);

            EraseOldUnderline.call(this);
            EraseOldNameText.call(this);

            DrawNonDottedUnderline.call(this);
            DrawNameWithNormalKerning.call(this);

            DrawLCLabel.call(this);

            FixTheCursor.call(this); 
        }

        function UpdateRects()
        {
            UpdateFullUnderlineRect.call(this);
            UpdateNameRectForErasing.call(this);
            UpdateNameRectForDrawing.call(this);
            UpdateLetterCountRectForDrawing.call(this);
        }

        function UpdateFullUnderlineRect()
        {
            var forFirstGlyph = 0;
            this.fullUnderlineRect = this.underlineRect(forFirstGlyph);
            this.fullUnderlineRect.width = this.charWidth() * this._maxLength;

            var xOffset = Params().UnderlineXOffset;
            var yOffset = Params().UnderlineYOffset;
            this.fullUnderlineRect.x += xOffset;
            this.fullUnderlineRect.y += yOffset;
        };

        function Params()
        {
            return window.CGT.NaInFoFi.Params;
        }
        
        function UpdateNameRectForErasing()
        {
            var forFirstGlyph = 0;
            this.nameRectForErasing = this.itemRect(forFirstGlyph);

            // We want it moved slightly to the left for the parts of the glyphs
            // drawn to the left of the orig rect boundaries
            this.nameRectForErasing.x -= xOffsetForErasing;

            // To handle parts drawn to the right, we just have the rect width
            // be more than enough... like so.
            this.nameRectForErasing.width = 9999999; 
        };

        var xOffsetForErasing = 10;

        function UpdateNameRectForDrawing()
        {
            this.nameRectForDrawing = Object.assign({}, this.nameRectForErasing);
            var xOffset = Params().NameXOffset,
            yOffset = Params().NameYOffset;
            this.nameRectForDrawing.x += xOffset;
            this.nameRectForDrawing.y += yOffset;
            // ^To make sure that the name is in the right place relative to
            // the underline
            this.nameRectForDrawing.width -= 20;
        };

        function UpdateLetterCountRectForDrawing()
        {
            this.letterCountRectForDrawing = Object.assign({}, this.fullUnderlineRect);
            var xOffset = Params().LCLabelXOffset,
            yOffset = Params().LCLabelYOffset;
            this.letterCountRectForDrawing.x += xOffset;
            this.letterCountRectForDrawing.y += yOffset;
        }

        // Specifically, the underline and name text that the MV API uses by default
        function EraseOldUnderline()
        {
            var rect = this.fullUnderlineRect;
            this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
        };

        function EraseOldNameText()
        {
            var rect = this.nameRectForErasing;
            this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
        };

        function DrawNonDottedUnderline()
        {
            var rect = this.fullUnderlineRect;
            var width = Params().UnderlineWidth,
            height = Params().UnderlineHeight;
            var color = this.underlineColor();
            this.contents.paintOpacity = 48;
            this.contents.fillRect(rect.x, rect.y, width, height, color);
            this.contents.paintOpacity = 255;
        };

        function DrawNameWithNormalKerning()
        {
            var rect = this.nameRectForDrawing;
            var whatToDraw = this._name || "";
            var maxWidth = Params().UnderlineWidth - Params().NameXOffset;
            this.drawText(whatToDraw, rect.x, rect.y, maxWidth);
        };

        var preventCutoffFromTheRight = 9999999;

        function DrawLCLabel()
        {
            var rect = this.letterCountRectForDrawing;
            var name = this._name || "";
            var whatToDraw = name.length + "/" + this._maxLength;
            if (Params().ShowLCLabel)
            {
                whatToDraw += " " + Params().LCLabel;
            }
            var alignment = Params().LCLabelAlignment;
            var maxWidth = Params().UnderlineWidth;
            this.drawText(whatToDraw, rect.x, rect.y, maxWidth, alignment);
        }

        function FixTheCursor()
        {
            // Since the old one's too wide and only compatible with monospace fonts
            var cursorPos = DecideCursorPosition.call(this);
            this._cursorRect.x = cursorPos.x;
            this._cursorRect.y = cursorPos.y;

            var cursorSize = DecideCursorSize.call(this);
            this._cursorRect.width = cursorSize.width;
            this._cursorRect.height = cursorSize.height;
            this._refreshCursor();
        };

        function DecideCursorPosition()
        {
            var drawnThusFar = this._name || "";
            var whereNameIsDrawn = this.nameRectForDrawing;

            var x = whereNameIsDrawn.x + this.contents.measureTextWidth(drawnThusFar),
            y = whereNameIsDrawn.y;

            return {x: x, y: y};
        };

        function DecideCursorSize()
        {
            var width = CGT.NaInFoFi.Params.CursorWidth,
            height = this.lineHeight() - CGT.NaInFoFi.Params.UnderlineHeight;
            // ^So the cursor won't cut as much into the underline
            return { width: width, height: height };
        };

        Window_NameEdit.prototype.refresh = NewRefresh;
    }

})();