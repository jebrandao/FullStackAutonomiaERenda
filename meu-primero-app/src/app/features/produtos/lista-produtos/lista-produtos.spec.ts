import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ListaProdutos } from './lista-produtos';

describe('ListaProdutos', () => {
  let component: ListaProdutos;
  let fixture: ComponentFixture<ListaProdutos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaProdutos],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaProdutos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
