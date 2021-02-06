import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormatDatePipe } from '@app/shared/pipe/format-date.pipe';
import { ReversePipe } from '@app/shared/pipe/reverse.pipe';
import { ControlMessagesComponent } from '@app/shared/validators/control-messages/control-messages.component';
import { HasAnyAuthorityDirective } from './has-any-authority/has-any-authority.directive';
import { LoaderComponent } from './loader/loader.component';
import { ValidationService } from './validators/validation.service';

@NgModule({
  imports: [CommonModule],
  declarations: [
      LoaderComponent,
      ControlMessagesComponent,
      ReversePipe,
      FormatDatePipe,
      HasAnyAuthorityDirective,
    ],
  providers: [ValidationService],
  exports: [
      LoaderComponent,
      ControlMessagesComponent,
      ReversePipe,
      FormatDatePipe,
      HasAnyAuthorityDirective,
    ]
})
export class SharedModule {}
