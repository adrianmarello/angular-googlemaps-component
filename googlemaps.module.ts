import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoogleMapsComponent } from './googlemaps.component';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        GoogleMapsComponent
    ],
    exports: [
		GoogleMapsComponent
    ]
})
export class GoogleMapsModule {}