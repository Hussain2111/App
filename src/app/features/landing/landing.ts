import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Hero } from '../hero/hero';
import { Featurescards } from '../featurescards/featurescards';
import { Footer } from '../footer/footer';
import { HowItWorks } from '../../how-it-works/how-it-works';
@Component({
  imports: [Header, Hero, Featurescards, Footer, HowItWorks],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing {}
