import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchDto } from './dto/match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchEntity } from './entities/match.entity';
import { Repository } from 'typeorm';
import { MatchNotFoundException } from './exceptions/match.notfound.exception';

@Injectable()
export class MatchService {

  constructor(
    @InjectRepository(MatchEntity) private readonly matchRepository: Repository<MatchEntity>,
  ) { }

  public async getAllMatches(): Promise<MatchDto[]> {
    const allMatches = await this.matchRepository.find();
    return allMatches.map((match: MatchEntity) => MatchDto.createFromEntity(match));
  }

  public async createNewMatch(match: MatchDto): Promise<MatchDto> {
    const newMatchEntity = MatchEntity.createFromDto(match);
    const savedMatch = await this.matchRepository.save(newMatchEntity);
    return MatchDto.createFromEntity(savedMatch);
  }

  public async getMatchById(matchId: string): Promise<MatchDto> {
    const foundMatch = await this.matchRepository.findOne(matchId);

    if (!foundMatch) {
      throw new MatchNotFoundException();
    }

    return MatchDto.createFromEntity(foundMatch);
  }

  public async updateMatch(matchId: string, match: MatchDto): Promise<MatchDto> {
    const matchToBeChanged = await this.matchRepository.findOne(matchId);

    if (!matchToBeChanged) {
      throw new MatchNotFoundException();
    }

    const { homeTeamGoals, guestTeamGoals } = match;
    matchToBeChanged.homeTeamGoals = homeTeamGoals;
    matchToBeChanged.guestTeamGoals = guestTeamGoals;

    const updatedMatch = await this.matchRepository.save(matchToBeChanged);

    return MatchDto.createFromEntity(updatedMatch);
  }

  public async finishMatch(matchId: string): Promise<MatchDto> {
    const matchToBeFinished = await this.matchRepository.findOne(matchId);

    if (!matchToBeFinished) {
      throw new MatchNotFoundException();
    }

    matchToBeFinished.isMatchFinished = true;
    const finishedMatch = await this.matchRepository.save(matchToBeFinished);

    return MatchDto.createFromEntity(finishedMatch);
  }
}
