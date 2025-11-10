import * as alt from 'alt-client';
// Класс для создания и уничтожения визуальных элементов точки
export class PointVisuals {
    constructor(pointConfig) {
        this.pointConfig = pointConfig;
        this.position = new alt.Vector3(pointConfig.x, pointConfig.y, pointConfig.z);

        this.marker = null;
        this.blip = null;
        this.colshape = null;
    }

    create() {
        //Так как colshapeRadius у полицейских учатсков не прописан в конфиге он undefined
        if (this.pointConfig.colshapeRadius === undefined){
            this.pointConfig.colshapeRadius = 350;
        }
        // Создание маркера
        //у полицейских участков нет маркера в конфиге поэтому он undefined
        if (this.pointConfig.markerType !== undefined) {
            this.marker = new alt.Marker(this.pointConfig.markerType, this.position, new alt.RGBA(
                this.pointConfig.markerColor[0], 
                this.pointConfig.markerColor[1], 
                this.pointConfig.markerColor[2], 
                this.pointConfig.markerColor[3]
                )
            );
        }

    // Создание блипа
    this.blip = new alt.PointBlip(this.position.x, this.position.y, this.position.z);
    this.blip.sprite = this.pointConfig.blipSprite;
    this.blip.color = this.pointConfig.blipColor;
    this.blip.name = this.pointConfig.name;
    this.blip.shortRange = this.pointConfig.blipshortRange;

    // Создание колшейпа
    this.colshape = new alt.ColshapeSphere(
        this.position.x, 
        this.position.y, 
        this.position.z,
        this.pointConfig.colshapeRadius
    );

    return this;
    }

    destroy() {
        if (this.marker) this.marker.destroy();
        if (this.blip) this.blip.destroy();
        if (this.colshape) this.colshape.destroy();
    }
}