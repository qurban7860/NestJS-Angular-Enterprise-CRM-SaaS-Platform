import { Result } from '../../domain/base/result';

export abstract class UseCase<IRequest, IResponse> {
  abstract execute(request?: IRequest): Promise<Result<IResponse>> | Result<IResponse>;
}
