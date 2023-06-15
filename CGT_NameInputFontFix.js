/*:
* @plugindesc Makes it so that the default name-input screen works well
with just about any font.
@author CG-Tespy – https://github.com/CG-Tespy
* @help This is version 1.00.01 of this plugin. The params are to help
* make things friendlier for whatever font you want to use for the game,
* though the defaults are probably good enough for most cases.
*
* Tested for compatibility with these plugins:
*
* SumRndmDude's Name Input Upgrade (SRD_NameInputUpgrade)
* 
* @param UnderlineWidth
* @type number
* @default 225
*
* @param UnderlineHeight
* @type number
* @default 3
*
* @param CursorWidth
* @type number
* @default 3
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
            defaultCursorWidth: 3,
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
            var pluginName = "CGT_NameInputFontFix";
            var rawParams = PluginManager.parameters(pluginName);
            var paramNames = 
            {
                UnderlineWidth: "UnderlineWidth",
                UnderlineHeight: "UnderlineHeight",
                CursorWidth: "CursorWidth",
            };
    
            var parsedParams = 
            {
                UnderlineWidth: Number(rawParams[paramNames.UnderlineWidth]) || 
                NaInFoFi.defaultUnderlineWidth,
    
                UnderlineHeight: Number(rawParams[paramNames.UnderlineHeight]) ||
                NaInFoFi.defaultUnderlineHeight,
    
                CursorWidth: Number(rawParams[paramNames.CursorWidth]) ||
                NaInFoFi.defaultCursorWidth,
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

            FixTheCursor.call(this); 
        }

        function UpdateRects()
        {
            UpdateFullUnderlineRect.call(this);
            UpdateNameRectForErasing.call(this);
            UpdateNameRectForDrawing.call(this);
        }

        function UpdateFullUnderlineRect()
        {
            var forFirstGlyph = 0;
            this.fullUnderlineRect = this.underlineRect(forFirstGlyph);
            this.fullUnderlineRect.width = this.charWidth() * this._maxLength;
        };
        
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
            this.nameRectForDrawing.x += XOffsetForDrawing.call(this);
            // ^Without this adjustment, the first glyph would be drawn to the 
            // left of the start of the underline
        };

        function XOffsetForDrawing()
        {
            var extraOffset = 15; 
            // ^So the first glyph and the start of the underline aren't too close
            // to each other.
            var result = xOffsetForErasing + extraOffset;
            return result;
        };

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
            var x = rect.x, y = rect.y, 
            width = CGT.NaInFoFi.Params.UnderlineWidth,
            height = CGT.NaInFoFi.Params.UnderlineHeight;
            var color = this.underlineColor();
            this.contents.paintOpacity = 48;
            this.contents.fillRect(rect.x, rect.y, width, height, color);
            this.contents.paintOpacity = 255;
        };

        function DrawNameWithNormalKerning()
        {
            var rect = this.nameRectForDrawing;
            var nameToDraw = this._name || "";
            var preventCutoffFromTheRight = 9999999;
            this.drawText(nameToDraw, rect.x, rect.y, preventCutoffFromTheRight);
        };

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