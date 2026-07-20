import { Module } from '@nestjs/common';
import { EventModule } from '../EventModule/eventModule';
import GitHubConnectionEntity from './githubConnectionEntity';
import { GitHubController } from './githubController';
import { GitHubService } from './githubService';

@Module({
  imports: [EventModule],
  controllers: [GitHubController],
  providers: [
    GitHubService,
    {
      provide: 'GITHUB_CONNECTION_REPOSITORY',
      useValue: GitHubConnectionEntity,
    },
  ],
  exports: [GitHubService],
})
export class GitHubModule {}
