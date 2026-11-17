import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { ProdutosService } from './produtos.service';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/produtos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProdutosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca a lista de produtos na API', () => {
    service.buscarProdutos().subscribe((lista) => expect(lista.length).toBe(1));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: '1', nome: 'Mouse', preco: 10, descricao: '', estoque: 1 }]);
  });

  it('cria um produto com POST', () => {
    service.criar({ nome: 'Teclado', preco: 50 }).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'Teclado', preco: 50 });
    req.flush({});
  });

  it('remove um produto com DELETE', () => {
    service.remover('abc').subscribe();
    const req = http.expectOne(`${url}/abc`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
