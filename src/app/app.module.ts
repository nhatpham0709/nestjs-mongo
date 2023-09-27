import { Module } from '@nestjs/common'
import { JobsModule } from 'src/jobs/jobs.module'
import { RouterModule } from 'src/router/router.module'
import { CommonModule } from 'src/common/common.module'

@Module({
  providers: [],
  imports: [
    CommonModule,
    JobsModule.forRoot(),
    RouterModule.forRoot(),
  ],
})
export class AppModule {}
