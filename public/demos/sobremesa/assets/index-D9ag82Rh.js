const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./product-ByvAQyXQ.js","./three.core-BnyATOTM.js","./bottle-JUTJTC_8.js","./story-DEYPk3Nw.js","./preload-helper-IQOi9ru3.js","./story-Dr-e4nt3.css","./showroom-jyd42i1t.js","./steam-DozDKHBM.js","./showroom-DkXjnwEV.css"])))=>i.map(i=>d[i]);
import{a as e,n as t,r as n}from"./BufferGeometryUtils-jD_E6XKo.js";import{$ as r,B as i,Cn as a,Ct as o,D as s,E as c,En as l,Et as u,Hn as d,K as f,Kn as p,N as m,Nn as h,O as g,On as _,R as v,S as y,Un as b,V as ee,W as x,Wn as S,X as C,a as w,at as T,bt as E,d as D,dn as te,f as O,fn as k,ft as A,i as j,it as ne,kn as re,o as M,ot as N,p as ie,pt as ae,rt as oe,st as se,ut as ce,vt as le,wn as ue,x as de,xn as fe,xt as pe,z as P}from"./three.core-BnyATOTM.js";import{i as me,n as he,r as ge,t as _e}from"./preload-helper-IQOi9ru3.js";import{t as ve}from"./bottle-JUTJTC_8.js";import{t as ye}from"./steam-DozDKHBM.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var be=class extends a{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new j;e.deleteAttribute(`uv`);let t=new ae({side:1}),n=new ae,r=new o(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let i=new N(e,t);i.position.set(-.757,13.219,.717),i.scale.set(31.713,28.305,28.591),this.add(i);let a=new x(e,n,6),s=new le;s.position.set(-10.906,2.009,1.846),s.rotation.set(0,-.195,0),s.scale.set(2.328,7.905,4.651),s.updateMatrix(),a.setMatrixAt(0,s.matrix),s.position.set(-5.607,-.754,-.758),s.rotation.set(0,.994,0),s.scale.set(1.97,1.534,3.955),s.updateMatrix(),a.setMatrixAt(1,s.matrix),s.position.set(6.167,.857,7.803),s.rotation.set(0,.561,0),s.scale.set(3.927,6.285,3.687),s.updateMatrix(),a.setMatrixAt(2,s.matrix),s.position.set(-2.017,.018,6.124),s.rotation.set(0,.333,0),s.scale.set(2.002,4.566,2.064),s.updateMatrix(),a.setMatrixAt(3,s.matrix),s.position.set(2.291,-.756,-2.621),s.rotation.set(0,-.286,0),s.scale.set(1.546,1.552,1.496),s.updateMatrix(),a.setMatrixAt(4,s.matrix),s.position.set(-2.193,-.369,-5.547),s.rotation.set(0,.516,0),s.scale.set(3.875,3.487,2.986),s.updateMatrix(),a.setMatrixAt(5,s.matrix),this.add(a);let c=new N(e,F(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new N(e,F(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let u=new N(e,F(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);let d=new N(e,F(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let f=new N(e,F(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let p=new N(e,F(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function F(e){return new ce({color:0,emissive:16777215,emissiveIntensity:e})}var xe=class extends de{constructor(e){super(e),this.type=P}parse(e){let t=function(e,t){switch(e){case 1:throw Error(`THREE.HDRLoader: Read Error: `+(t||``));case 2:throw Error(`THREE.HDRLoader: Write Error: `+(t||``));case 3:throw Error(`THREE.HDRLoader: Bad File Format: `+(t||``));default:case 4:throw Error(`THREE.HDRLoader: Memory Error: `+(t||``))}},n=function(e,t,n){t||=1024;let r=e.pos,i=-1,a=0,o=``,s=String.fromCharCode.apply(null,new Uint16Array(e.subarray(r,r+128)));for(;0>(i=s.indexOf(`
`))&&a<t&&r<e.byteLength;)o+=s,a+=s.length,r+=128,s=String.fromCharCode.apply(null,new Uint16Array(e.subarray(r,r+128)));return-1<i&&(!1!==n&&(e.pos+=a+i+1),o+s.slice(0,i))},i=function(e){let r=/^#\?(\S+)/,i=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,a=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,o=/^\s*FORMAT=(\S+)\s*$/,s=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,c={valid:0,string:``,comments:``,programtype:`RGBE`,format:``,gamma:1,exposure:1,width:0,height:0},l,u;for((e.pos>=e.byteLength||!(l=n(e)))&&t(1,`no header found`),(u=l.match(r))||t(3,`bad initial token`),c.valid|=1,c.programtype=u[1],c.string+=l+`
`;l=n(e),!1!==l;)if(c.string+=l+`
`,l.charAt(0)===`#`)c.comments+=l+`
`;else if((u=l.match(i))&&(c.gamma=parseFloat(u[1])),(u=l.match(a))&&(c.exposure=parseFloat(u[1])),(u=l.match(o))&&(c.valid|=2,c.format=u[1]),(u=l.match(s))&&(c.valid|=4,c.height=parseInt(u[1],10),c.width=parseInt(u[2],10)),c.valid&2&&c.valid&4)break;return c.valid&2||t(3,`missing format specifier`),c.valid&4||t(3,`missing image size specifier`),c},a=function(e,n,r){let i=n;if(i<8||i>32767||e[0]!==2||e[1]!==2||e[2]&128)return new Uint8Array(e);i!==(e[2]<<8|e[3])&&t(3,`wrong scanline width`);let a=new Uint8Array(4*n*r);a.length||t(4,`unable to allocate buffer space`);let o=0,s=0,c=4*i,l=new Uint8Array(4),u=new Uint8Array(c),d=r;for(;d>0&&s<e.byteLength;){s+4>e.byteLength&&t(1),l[0]=e[s++],l[1]=e[s++],l[2]=e[s++],l[3]=e[s++],(l[0]!=2||l[1]!=2||(l[2]<<8|l[3])!=i)&&t(3,`bad rgbe scanline format`);let n=0,r;for(;n<c&&s<e.byteLength;){r=e[s++];let i=r>128;if(i&&(r-=128),(r===0||n+r>c)&&t(3,`bad scanline data`),i){let t=e[s++];for(let e=0;e<r;e++)u[n++]=t}else u.set(e.subarray(s,s+r),n),n+=r,s+=r}let f=i;for(let e=0;e<f;e++){let t=0;a[o]=u[e+t],t+=i,a[o+1]=u[e+t],t+=i,a[o+2]=u[e+t],t+=i,a[o+3]=u[e+t],o+=4}d--}return a},o=function(e,t,n,r){let i=2**(e[t+3]-128)/255;n[r+0]=e[t+0]*i,n[r+1]=e[t+1]*i,n[r+2]=e[t+2]*i,n[r+3]=1},s=function(e,t,n,r){let i=2**(e[t+3]-128)/255;n[r+0]=y.toHalfFloat(Math.min(e[t+0]*i,65504)),n[r+1]=y.toHalfFloat(Math.min(e[t+1]*i,65504)),n[r+2]=y.toHalfFloat(Math.min(e[t+2]*i,65504)),n[r+3]=y.toHalfFloat(1)},c=new Uint8Array(e);c.pos=0;let l=i(c),u=l.width,d=l.height,f=a(c.subarray(c.pos),u,d),p,h,g;switch(this.type){case m:g=f.length/4;let e=new Float32Array(g*4);for(let t=0;t<g;t++)o(f,t*4,e,t*4);p=e,h=m;break;case P:g=f.length/4;let t=new Uint16Array(g*4);for(let e=0;e<g;e++)s(f,e*4,t,e*4);p=t,h=P;break;default:throw Error(`THREE.HDRLoader: Unsupported type: `+this.type)}return{width:u,height:d,data:p,header:l.string,gamma:l.gamma,exposure:l.exposure,type:h,colorSpace:r,minFilter:C,magFilter:C,generateMipmaps:!1,flipY:!0}}setDataType(e){return this.type=e,this}},I={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Se=class extends me{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},Ce=class extends me{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},we=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new d);this._width=n.width,this._height=n.height,t=new p(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:P}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new he(I),this.copyPass.material.blending=0,this.timer=new re}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}Se!==void 0&&(r instanceof Se?n=!0:r instanceof Ce&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new d);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},Te=class extends me{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new O}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},Ee={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new O(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},De=class e extends me{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new d(256,256):new d(e.x,e.y),this.clearColor=new O(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new p(i,a,{type:P,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new p(i,a,{type:P,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new p(i,a,{type:P,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=Ee;this.highPassUniforms=h.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ue({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new d(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=h.clone(I.uniforms),this.blendMaterial=new ue({uniforms:this.copyUniforms,vertexShader:I.vertexShader,fragmentShader:I.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new O,this._oldClearAlpha=1,this._basic=new se,this._fsQuad=new ge(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new d(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new ue({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new d(.5,.5)},direction:{value:new d(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new ue({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};De.BlurDirectionX=new d(1,0),De.BlurDirectionY=new d(0,1);var Oe={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},ke=class extends me{constructor(){super(),this.isOutputPass=!0,this.uniforms=h.clone(Oe.uniforms),this.material=new te({name:Oe.name,uniforms:this.uniforms,vertexShader:Oe.vertexShader,fragmentShader:Oe.fragmentShader}),this._fsQuad=new ge(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ie.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Ae=e=>Math.min(1,Math.max(0,e));function je(){let e=document.querySelector(`[data-hero]`);if(!e)return{update(){}};e.querySelectorAll(`[data-rise]`).forEach(e=>e.style.setProperty(`--rise`,e.dataset.rise));let t=!1,n=-1,r=null;function i(i,a){let o=a.heroAt-.5;!t&&i>=o&&(t=!0,e.classList.add(`is-in`));let s=Ae((i-a.heroAt-.3)/1.55),c=s*s*(3-2*s),l=Math.round(c*1e3)/1e3;l!==n&&(n=l,e.style.setProperty(`--hero-out`,l));let u=i<o||c>=1;u!==r&&(r=u,e.classList.toggle(`is-gone`,u),e.inert=u)}return{update:i}}var Me={ritual:{sel:`[data-ritual]`,from:4.3,to:7.1},mist:{sel:`[data-mist]`,from:7.35,to:10.3}};function Ne({sel:e,from:t,to:n}){let r=document.querySelector(e);if(!r)return{update(){}};r.querySelectorAll(`[data-rise]`).forEach(e=>e.style.setProperty(`--rise`,e.dataset.rise));let i=null;function a(e,a){let o=e-a.land,s=o>t&&o<n;s!==i&&(i=s,r.classList.toggle(`is-in`,s),r.setAttribute(`aria-hidden`,String(!s)))}return{update:a}}var Pe=()=>Ne(Me.ritual),Fe=()=>Ne(Me.mist);function Ie(){let e=document.querySelector(`[data-shade]`);if(!e)return{update(){}};let t=null;function n(n,r){let i=n>=r.heroAt-.5&&n-r.land<Me.mist.to;i!==t&&(t=i,e.classList.toggle(`is-in`,i))}return{update:n}}var Le=e=>Math.min(1,Math.max(0,e)),Re=(e,t,n)=>{let r=Le((n-e)/(t-e));return r*r*(3-2*r)};function ze({marks:e,end:t}){let n=e[e.length-1].q||t,r=document.createElement(`nav`);r.className=`tl`,r.setAttribute(`aria-hidden`,`true`),r.innerHTML=`<div class="tl__track"><div class="tl__fill"></div>${e.map(e=>`<div class="tl__mark" style="--at:${(e.q/n).toFixed(4)}"><span class="tl__dot"></span><span class="tl__label">${e.label}</span></div>`).join(``)}</div>`,document.body.append(r);let i=r.querySelector(`.tl__fill`),a=[...r.querySelectorAll(`.tl__mark`)],o={in:null,k:-1,fade:-1,current:-1},s=t-.6,c=t-.25;function l(t,l){l!==o.in&&(o.in=l,r.classList.toggle(`is-in`,l));let u=Math.round(Le(t/n)*1e3)/1e3;u!==o.k&&(o.k=u,i.style.transform=`scaleY(${u})`);let d=Math.round((1-Re(s,c,t))*100)/100;d!==o.fade&&(o.fade=d,r.style.setProperty(`--tl-fade`,d),r.classList.toggle(`is-gone`,d<=0));let f=0;e.forEach((e,n)=>{t>=e.q-.02&&(f=n)}),f!==o.current&&(o.current=f,a.forEach((e,t)=>{e.classList.toggle(`is-past`,t<f),e.classList.toggle(`is-current`,t===f)}))}return{update:l}}var Be={src:``,srcPortrait:``,alt:``,hazeColor:[221,229,244],restingHaze:.38,introHaze:.97,introMs:3200,blurPx:20,brushRadius:130,holdMs:650,refogMs:2400,cell:10,fogScale:.5,ambientEveryMs:2500,ambientRadius:0,ambientFadeMs:1100,ambientHoldMs:1400,ambientSpots:null,particles:!0,particleEveryPx:14,particleMax:120,particleOpacity:.85,particleSize:[1.2,3.2],particleLifeMs:[900,1900],particleShape:`mote`,particleColors:[[238,243,252],[208,222,248],[176,198,244],[226,222,250]],pointerTarget:null,onReady:null},Ve=e=>e<0?0:e>1?1:e,He=e=>e*e*(3-2*e),Ue=e=>1-(1-e)**3,We=e=>.5-Math.cos(Math.PI*e)/2,Ge=([e,t])=>e+Math.random()*(t-e),L=64;function Ke(e){let t=document.createElement(`canvas`);t.width=L,t.height=L;let n=t.getContext(`2d`),r=L/2,[i,a,o]=e,s=n.createRadialGradient(r,r,0,r,r,r);s.addColorStop(0,`rgba(107, 64, 26, 0.16)`),s.addColorStop(1,`rgba(107, 64, 26, 0)`),n.fillStyle=s,n.fillRect(0,0,L,L);let c=n.createRadialGradient(r,r,0,r,r,r*.62);return c.addColorStop(0,`rgba(${i}, ${a}, ${o}, 1)`),c.addColorStop(.2,`rgba(${i}, ${a}, ${o}, 0.95)`),c.addColorStop(.42,`rgba(${i}, ${a}, ${o}, 0.28)`),c.addColorStop(1,`rgba(${i}, ${a}, ${o}, 0)`),n.fillStyle=c,n.fillRect(0,0,L,L),t}function qe(e){let t=document.createElement(`canvas`);t.width=L,t.height=L;let n=t.getContext(`2d`),[r,i,a]=e,o=()=>{n.beginPath(),n.moveTo(32,58),n.bezierCurveTo(15,51,12,25,32,6),n.bezierCurveTo(52,25,49,51,32,58),n.closePath()},s=n.createLinearGradient(32,58,32,6);s.addColorStop(0,`rgba(255, 248, 244, 1)`),s.addColorStop(.45,`rgba(${Math.round((r+255)/2)}, ${Math.round((i+244)/2)}, ${Math.round((a+240)/2)}, 1)`),s.addColorStop(1,`rgba(${r}, ${i}, ${a}, 1)`),n.save(),n.shadowColor=`rgba(107, 64, 26, 0.3)`,n.shadowBlur=5,n.shadowOffsetY=1.5,o(),n.fillStyle=s,n.fill(),n.restore();let c=n.createLinearGradient(16,0,48,0);return c.addColorStop(0,`rgba(255, 255, 255, 0.35)`),c.addColorStop(.5,`rgba(255, 255, 255, 0)`),c.addColorStop(1,`rgba(107, 64, 26, 0.08)`),o(),n.fillStyle=c,n.fill(),n.strokeStyle=`rgba(${Math.round(r*.7)}, ${Math.round(i*.6)}, ${Math.round(a*.65)}, 0.28)`,n.lineWidth=.7,n.stroke(),n.beginPath(),n.moveTo(32,54),n.quadraticCurveTo(31,32,32,13),n.moveTo(30,50),n.quadraticCurveTo(23,36,25,20),n.moveTo(34,50),n.quadraticCurveTo(41,36,39,20),n.strokeStyle=`rgba(${Math.round(r*.75)}, ${Math.round(i*.6)}, ${Math.round(a*.7)}, 0.16)`,n.lineWidth=.6,n.stroke(),t}function Je(e,t,n,r){let i=Math.max(n/e,r/t),a=e*i,o=t*i;return[(n-a)/2,(r-o)/2,a,o]}function Ye(e,t){return Ve(.5+(Math.sin(e*.021+1.3)*Math.cos(t*.017-.4)+.6*Math.sin((e+t)*.033+2.1)+.4*Math.cos((e-t)*.047-1.7))/4)}function Xe(e,t,n,r){let i=Math.max(1,Math.ceil(t/8)),a=Math.max(1,Math.ceil(n/8)),o=document.createElement(`canvas`);o.width=i,o.height=a;let s=o.getContext(`2d`,{willReadFrequently:!0});s.imageSmoothingQuality=`high`;let[c,l,u,d]=Je(e.naturalWidth,e.naturalHeight,i,a);s.drawImage(e,c,l,u,d);let f;try{f=s.getImageData(0,0,i,a).data}catch{return[]}let p=i*a,m=e=>{let t=new Uint8Array(p);for(let n=0;n<p;n++)t[n]=f[n*4+e];return t.sort()[p>>1]},h=[m(0),m(1),m(2)],g=new Float32Array(p);for(let e=0;e<p;e++){let[t,n,r]=[f[e*4],f[e*4+1],f[e*4+2]];g[e]=n>t&&n>r?0:Math.hypot(t-h[0],n-h[1],r-h[2])}let _=Math.max(1,Math.round(r/8/4)),v=(e,t)=>{let n=new Float32Array(p),r=t?i:a,o=t?a:i;for(let a=0;a<o;a++)for(let o=0;o<r;o++){let s=0,c=0;for(let n=Math.max(0,o-_);n<=Math.min(r-1,o+_);n++)s+=e[t?a*i+n:n*i+a],c++;n[t?a*i+o:o*i+a]=s/c}return n};for(let e=0;e<2;e++)g=v(v(g,!0),!1);let y=Array.from(g.keys()).sort((e,t)=>g[t]-g[e]),b=Math.max(14,g[y[0]]*.35),ee=r*1.6,x=r*.5,S=[];for(let e of y){if(g[e]<b||S.length>=24)break;let r=(e%i+.5)*8,a=(Math.floor(e/i)+.5)*8;r<x||a<x||r>t-x||a>n-x||S.every(([e,t])=>Math.hypot(e-r,t-a)>=ee)&&S.push([r,a])}return S}function Ze(e,t={}){let n={...Be};for(let[e,r]of Object.entries(t))r!==void 0&&(n[e]=r);let r=n.pointerTarget||e,i=window.matchMedia(`(prefers-reduced-motion: reduce)`),a=new Image;a.className=`fr-image`,a.alt=n.alt,a.decoding=`async`,a.draggable=!1;let o=document.createElement(`canvas`);o.className=`fr-fog`,o.setAttribute(`aria-hidden`,`true`);let s=o.getContext(`2d`),c=document.createElement(`canvas`);c.className=`fr-particles`,c.setAttribute(`aria-hidden`,`true`);let l=c.getContext(`2d`),u=1,d=new Map,f=document.createElement(`canvas`),p=document.createElement(`canvas`),m=p.getContext(`2d`);e.classList.add(`fr-layer`),e.append(a,o,c);let h=0,g=0,_=0,v=0,y=new Float32Array,b=new Float32Array,ee=new Float32Array,x=null,S=null,C=``,w=!1,T=!1,E=!0,D=0,te=0,O=0,k=null,A=[],j=[],ne=[],re=0,M=[],N=0;function ie(){return Math.min(n.brushRadius,Math.min(h,g)*.24)}function ae(){return n.ambientRadius||ie()*1.25}function oe(){return[].concat(n.ambientEveryMs)[0]>0&&!i.matches}function se(){n.ambientSpots?A=n.ambientSpots.map(([e,t])=>[e*h,t*g]):oe()&&(A=Xe(S,h,g,ae())),j=[]}function ce(){let e=o.width,t=o.height;f.width=e,f.height=t;let r=f.getContext(`2d`),i=n.blurPx*n.fogScale,a=Math.ceil(i*3),[s,c,l,u]=Je(S.naturalWidth,S.naturalHeight,e+a*2,t+a*2);if(typeof r.filter==`string`)r.filter=`blur(${i}px)`,r.drawImage(S,s-a,c-a,l,u),r.filter=`none`;else{let n=document.createElement(`canvas`);n.width=Math.max(1,Math.round(e/14)),n.height=Math.max(1,Math.round(t/14));let i=n.getContext(`2d`);i.imageSmoothingQuality=`high`,i.drawImage(S,(s-a)/14,(c-a)/14,l/14,u/14),r.imageSmoothingQuality=`high`,r.drawImage(n,0,0,e,t)}}function le(){let t=e.getBoundingClientRect();if(!t.width||!t.height)return;h=t.width,g=t.height,o.width=Math.max(1,Math.round(h*n.fogScale)),o.height=Math.max(1,Math.round(g*n.fogScale)),u=Math.min(2,window.devicePixelRatio||1),c.width=Math.max(1,Math.round(h*u)),c.height=Math.max(1,Math.round(g*u)),M=[],_=Math.ceil(h/n.cell)+1,v=Math.ceil(g/n.cell)+1,y=new Float32Array(_*v).fill(1),b=new Float32Array(_*v).fill(-1/0),ee=new Float32Array(_*v);for(let e=0;e<v;e++)for(let t=0;t<_;t++)ee[e*_+t]=.55+.9*Ye(t*n.cell,e*n.cell);p.width=_,p.height=v,x=m.createImageData(_,v),x.data.fill(255);let r=ue();r!==C&&de(r),w&&(ce(),se(),I())}function ue(){return n.srcPortrait&&g>h*1.1?n.srcPortrait:n.src}function de(t){C=t;let r=new Image;r.src=t,r.decode().catch(()=>void 0).then(()=>{T||t!==C||(r.naturalWidth?(S=r,a.src=t,e.classList.remove(`is-error`),w?(ce(),se(),I()):(w=!0,O=i.matches?0:performance.now(),e.classList.add(`is-ready`),i.matches||e.classList.add(`is-intro`),le(),Se.observe(e),Ce.observe(e),ve(O?n.introMs:0),n.onReady?.())):e.classList.add(`is-error`))})}function fe(e,t,r,i,a=1,o=i){let s=n.cell,c=Math.max(0,Math.floor((e-r)/s)),l=Math.min(_-1,Math.ceil((e+r)/s)),u=Math.max(0,Math.floor((t-r)/s)),d=Math.min(v-1,Math.ceil((t+r)/s));for(let n=u;n<=d;n++)for(let i=c;i<=l;i++){let c=Math.hypot(i*s-e,n*s-t)/r;if(c>=1)continue;let l=a*(c<.42?1:1-He((c-.42)/.58)),u=n*_+i,d=1-l;d<y[u]&&(y[u]=d),l>.3&&o>b[u]&&(b[u]=o)}}function pe(e,t){if(!_)return;let n=performance.now(),r=ie();if(k&&n-k.t<120){let i=e-k.x,a=t-k.y,o=Math.min(40,Math.ceil(Math.hypot(i,a)/(r*.3)));for(let e=1;e<=o;e++)fe(k.x+i*e/o,k.y+a*e/o,r,n)}else fe(e,t,r,n);k&&n-k.t<120&&me(k.x,k.y,e,t,n),k={x:e,y:t,t:n},I()}function P(e){let t=e.join(`,`),r=d.get(t);return r||d.set(t,r=n.particleShape===`petal`?qe(e):Ke(e)),r}function me(e,t,r,a,o){if(!n.particles||i.matches)return;let s=r-e,c=a-t,l=Math.hypot(s,c);if(!l)return;N+=l;let u=Math.min(.08,l/700);for(;N>=n.particleEveryPx;){N-=n.particleEveryPx;let r=Ve(1-N/l),i=1+Math.floor(Math.random()*2);for(let a=0;a<i;a++){M.length>=n.particleMax&&M.shift();let i=Math.random()*Math.PI*2,a=.008+Math.random()*.04;n.particleShape===`petal`?M.push({x:e+s*r+(Math.random()-.5)*22,y:t+c*r+(Math.random()-.5)*22,vx:s/l*u*(.4+Math.random())+Math.cos(i)*a,vy:c/l*u*(.4+Math.random())-.02-Math.random()*.03,size:Ge(n.particleSize),sprite:P(n.particleColors[Math.floor(Math.random()*n.particleColors.length)]),born:o,life:Ge(n.particleLifeMs),rot:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.004,flip:Math.random()*Math.PI*2,flipSpeed:.002+Math.random()*.004,sway:Math.random()*Math.PI*2}):M.push({x:e+s*r+(Math.random()-.5)*18,y:t+c*r+(Math.random()-.5)*18,vx:s/l*u*Math.random()+Math.cos(i)*a,vy:c/l*u*Math.random()+Math.sin(i)*a,size:Ge(n.particleSize),sprite:P(n.particleColors[Math.floor(Math.random()*n.particleColors.length)]),born:o,life:Ge(n.particleLifeMs),twinkle:Math.random()*Math.PI*2,twinkleSpeed:.006+Math.random()*.01})}}}function he(e,t){let r=u;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,c.width,c.height),M=M.filter(t=>e-t.born<t.life);let i=.994**t;if(n.particleShape===`petal`){let i=.997**t;for(let a of M){let o=(e-a.born)/a.life;a.vx*=i,a.vy=a.vy*i+5e-5*t,a.sway+=.0028*t,a.x+=(a.vx+Math.sin(a.sway)*.018)*t,a.y+=a.vy*t,a.rot+=a.spin*t+Math.cos(a.sway)*9e-4*t,a.flip+=a.flipSpeed*t;let s=Math.min(1,o/.1)*(1-He(Ve((o-.6)/.4))),c=Math.cos(a.flip),u=a.size*r/(L*.82);l.globalAlpha=Ve(n.particleOpacity*s*(.8+.2*Math.abs(c))),l.setTransform(1,0,0,1,a.x*r,a.y*r),l.rotate(a.rot),l.scale(u*Math.max(.18,Math.abs(c)),u),l.drawImage(a.sprite,-32,-32)}l.setTransform(1,0,0,1,0,0),l.globalAlpha=1}else{for(let a of M){let o=(e-a.born)/a.life;a.vx*=i,a.vy=a.vy*i-12e-6*t,a.x+=a.vx*t,a.y+=a.vy*t,a.twinkle+=a.twinkleSpeed*t;let s=Math.min(1,o/.08)*(1-He(Ve((o-.3)/.7))),c=.72+.28*Math.sin(a.twinkle);l.globalAlpha=Ve(n.particleOpacity*s*c);let u=a.size*8*(1-.45*o)*r;l.drawImage(a.sprite,a.x*r-u/2,a.y*r-u/2,u,u)}l.globalAlpha=1}}function ge(e,t){let r=Math.min(_-1,Math.max(0,Math.round(e/n.cell))),i=Math.min(v-1,Math.max(0,Math.round(t/n.cell)));return y[i*_+r]}function _e(){if(!A.length)return[h*(.1+.8*Math.random()),g*(.1+.8*Math.random())];let e=Math.min(3,A.length-1),t=A.filter(e=>!j.includes(e)&&ge(e[0],e[1])>.6),n=t.length?t:A,r=n[Math.floor(Math.random()*n.length)];return j=[r,...j].slice(0,e),r}function ve(e=0){if(clearTimeout(re),T||!oe())return;let[t,r=t]=[].concat(n.ambientEveryMs);re=setTimeout(ye,e+t+Math.random()*(r-t))}function ye(){if(w&&E&&!document.hidden&&_){let[e,t]=_e();ne.push({x:e,y:t,start:performance.now()}),I()}ve()}function be(t){if(!w)return;let n=e.getBoundingClientRect();pe(t.clientX-n.left,t.clientY-n.top)}function F(){k=null}function xe(e){if(D=0,T||!w)return;let t=Math.min(64,e-(te||e));te=e;let r=O?Ve((e-O)/n.introMs):1,i=n.introHaze+(n.restingHaze-n.introHaze)*Ue(r),a=r<1;if(ne.length){let t=ae(),r=e+n.ambientHoldMs-n.holdMs;ne=ne.filter(i=>{let a=Ve((e-i.start)/n.ambientFadeMs);return fe(i.x,i.y,t,e,We(a),r),a<1}),a=!0}let c=t/n.refogMs,l=x.data;for(let t=0,r=y.length;t<r;t++){let r=y[t];r<1&&(a=!0,e-b[t]>n.holdMs&&(r=Math.min(1,r+c*ee[t]),y[t]=r)),l[t*4+3]=He(r)*255}m.putImageData(x,0,0);let u=o.width,d=o.height,[h,g,S]=n.hazeColor;s.globalCompositeOperation=`copy`,s.drawImage(f,0,0),s.globalCompositeOperation=`source-over`,s.fillStyle=`rgba(${h}, ${g}, ${S}, ${i})`,s.fillRect(0,0,u,d);let C=n.cell*n.fogScale;s.globalCompositeOperation=`destination-in`,s.imageSmoothingEnabled=!0,s.imageSmoothingQuality=`high`,s.drawImage(p,-C/2,-C/2,_*C,v*C),s.globalCompositeOperation=`source-over`,M.length&&(he(e,t),a=!0),a&&E&&(D=requestAnimationFrame(xe))}function I(){!D&&w&&E&&!T&&(te=0,D=requestAnimationFrame(xe))}let Se=new ResizeObserver(le),Ce=new IntersectionObserver(([e])=>{E=e.isIntersecting,E&&I()});r.addEventListener(`pointermove`,be,{passive:!0}),r.addEventListener(`pointerdown`,be,{passive:!0}),r.addEventListener(`pointerleave`,F),r.addEventListener(`pointercancel`,F);let we=e.getBoundingClientRect();return h=we.width,g=we.height,de(ue()),{reveal(e,t){w&&pe(e,t)},update(e={}){let t={...n};for(let[t,r]of Object.entries(e))r!==void 0&&(n[t]=r);if(n.alt!==t.alt&&(a.alt=n.alt),n.src!==t.src||n.srcPortrait!==t.srcPortrait){let e=ue();e!==C&&de(e)}w&&(n.blurPx!==t.blurPx&&ce(),(n.brushRadius!==t.brushRadius||n.ambientRadius!==t.ambientRadius||String(n.ambientEveryMs)!==String(t.ambientEveryMs))&&se(),String(n.ambientEveryMs)!==String(t.ambientEveryMs)&&ve(),(n.particleColors!==t.particleColors||n.particleShape!==t.particleShape)&&(d=new Map),n.particles||(M=[],l.clearRect(0,0,c.width,c.height)),I())},destroy(){T=!0,D&&cancelAnimationFrame(D),clearTimeout(re),Se.disconnect(),Ce.disconnect(),r.removeEventListener(`pointermove`,be),r.removeEventListener(`pointerdown`,be),r.removeEventListener(`pointerleave`,F),r.removeEventListener(`pointercancel`,F),a.remove(),o.remove(),c.remove(),e.classList.remove(`fr-layer`,`is-ready`,`is-intro`,`is-error`)}}}var Qe=`./`,$e=1300,et=1200;function tt({onStart:e}){let t=document.querySelector(`.gate`);if(!t)return null;t.hidden=!1,document.querySelector(`.nav`).inert=!0;let n=t.querySelector(`.gate__glass`),r=t.querySelector(`.gate__mark`),i=t.querySelector(`.gate__start`),a=document.querySelector(`.brand__mark`),o=Ze(n,{src:`${Qe}img/gate-scene.jpg`,srcPortrait:`${Qe}img/gate-scene-portrait.jpg`,alt:``,hazeColor:[242,228,210],restingHaze:.46,introHaze:.98,blurPx:22,holdMs:180,refogMs:1e3,particleShape:`petal`,particleEveryPx:42,particleMax:50,particleOpacity:.95,particleSize:[20,32],particleLifeMs:[2200,3600],particleColors:[[255,252,244],[248,240,224],[240,228,206],[252,246,232]],pointerTarget:t}),s=!1;function c(){if(!a)return;let e=document.querySelector(`.nav`),t=r.getBoundingClientRect(),n=a.getBoundingClientRect(),i=e?new DOMMatrixReadOnly(getComputedStyle(e).transform).m42:0,o=n.left+n.width/2-(t.left+t.width/2),s=n.top-i+n.height/2-(t.top+t.height/2),c=n.width/t.width;document.documentElement.classList.add(`is-docking`),r.animate([{transform:`none`},{transform:`translate(${o}px, ${s}px) scale(${c})`}],{duration:$e,easing:`cubic-bezier(0.65, 0, 0.25, 1)`,fill:`forwards`}).finished.then(()=>{document.documentElement.classList.remove(`is-docking`),document.documentElement.classList.add(`is-docked`)})}function l(){s||i.disabled||(s=!0,e(),t.classList.add(`is-leaving`),document.querySelector(`.nav`).inert=!1,matchMedia(`(prefers-reduced-motion: reduce)`).matches?document.documentElement.classList.add(`is-docked`):c(),setTimeout(()=>{o.destroy(),t.remove()},Math.max($e,et)+100))}return i.addEventListener(`click`,l),{ready(){i.disabled=!1,t.classList.add(`is-ready`)}}}var nt=16,R=34,rt=[{name:`sepal`,count:5,len:.22,wid:.15,r0:.085,y0:.03,phase:.31,closed:{tilt:1.3,bend:1.25,pow:1,cup:.15},open:{tilt:1.45,bend:.45,pow:1.5,cup:.2},delay:0,sepal:!0},{name:`inner`,count:5,len:.86,wid:.17,r0:.1,y0:.065,phase:Math.PI/5,closed:{tilt:1.15,bend:1.65,pow:.4,cup:.16,point:.3},open:{tilt:1,bend:.45,pow:1.1,cup:.4},front:{tilt:.26,bend:-.55,cup:-.16},back:{tilt:-.35},delay:.7},{name:`middle`,count:5,len:.9,wid:.18,r0:.07,y0:.06,phase:Math.PI/5+.31,closed:{tilt:1.65,bend:2.3,pow:.4,cup:.18,len:.9,point:.4},open:{tilt:1.22,bend:.5,pow:2,cup:.27},front:{tilt:.3,bend:-.25},back:{tilt:-.74,bend:.2,cup:.2,len:.12,wid:.15},delay:.35},{name:`outer`,count:5,len:.96,wid:.2,r0:.095,y0:.055,phase:0,closed:{tilt:1.55,bend:2.4,pow:.6,cup:.2,len:.8,point:.45},open:{tilt:1.42,bend:.72,pow:2.2,cup:.28},delay:0}];function it(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var at=(e,t,n)=>e+(t-e)*n;function ot(e){return Math.sin(Math.PI*e**.72)**.6*(1-.35*(1-e)**3)+.22*(1-e)**2.4}function st(e,t,n){let{len:r,wid:i,bend:a,pow:o,cup:s,point:c}=e,l=0,u=0,d=r/R;for(let e=0;e<=R;e++){let t=a*(e/R)**+o;n[e*4]=l,n[e*4+1]=u,n[e*4+2]=Math.sin(t),n[e*4+3]=Math.cos(t);let r=a*((e+.5)/R)**+o;l+=Math.cos(r)*d,u-=Math.sin(r)*d}let f=0;for(let e=0;e<=R;e++){let r=e/R,a=Math.min(1,Math.max(0,(r-.45)/.55)),o=i*ot(r)*(1-c*a*a*(3-2*a)),l=s*(.7+.6*r),u=n[e*4],d=n[e*4+1],p=n[e*4+2],m=n[e*4+3];for(let e=0;e<=nt;e++){let n=e/nt*2-1,i=n*o/l,a=l*Math.sin(i),s=-l*(1-Math.cos(i))-.012*r**6*n*n;t[f++]=a,t[f++]=u+p*s,t[f++]=d+m*s}}}function ct(){let e=new M,t=new Float32Array(1785),n=new Float32Array(1190),r=0;for(let e=0;e<=R;e++)for(let t=0;t<=nt;t++)n[r++]=t/nt,n[r++]=e/R;let i=[];for(let e=0;e<R;e++)for(let t=0;t<nt;t++){let n=e*17+t,r=n+1,a=n+nt+1,o=a+1;i.push(n,a,r,r,a,o)}return e.setIndex(i),e.setAttribute(`position`,new w(t,3).setUsage(s)),e.setAttribute(`uv`,new w(n,2)),e.setAttribute(`normal`,new w(new Float32Array(1785),3)),e}var lt=`
uniform vec3 uBase;
uniform vec3 uMid;
uniform vec3 uEdge;
uniform vec3 uTip;
uniform vec3 uTrans;
uniform float uVein;
varying vec2 vPetalUv;
vec2 hash22(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
float hash12(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), f.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), f.x), f.y);
}
float cellEdge(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int y=-1; y<=1; y++) for (int x=-1; x<=1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = hash22(i + g);
    float d = length(g + o - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  return 1.0 - smoothstep(0.0, 0.09, d2 - d1);
}
// Vein structure shared by color and relief: x = combined mask, y = relief height.
vec2 petalVeins(vec2 uv){
  float u = uv.x * 2.0 - 1.0;
  float v = uv.y;
  float au = abs(u);
  float fan = u * (5.0 + 2.5 * v);
  float vein = 1.0 - smoothstep(0.0, 0.11, abs(fract(fan + 0.5) - 0.5));
  // wide, soft profile of the same veins for the relief (sharp grooves alias into stipple)
  float groove = 1.0 - smoothstep(0.0, 0.3, abs(fract(fan + 0.5) - 0.5));
  float mid = 1.0 - smoothstep(0.0, 0.05, au);
  float midRidge = 1.0 - smoothstep(0.0, 0.14, au);
  float net = cellEdge(vec2(u * 7.0, v * 15.0));
  float fade = smoothstep(0.02, 0.2, v) * (1.0 - smoothstep(0.86, 0.97, v));
  float mask = (vein * 0.55 + net * 0.35 + mid * 0.6) * uVein * fade;
  // veins sit in shallow, rounded grooves either side of a raised midrib; a slow
  // undulation keeps the blade from looking machined
  float h = (-groove * 0.7 + midRidge * 0.6) * fade + vnoise(uv * vec2(4.0, 7.0)) * 0.5;
  return vec2(mask, h * uVein);
}
`;function ut(e,{sepal:t=!1}={}){let n=new A({color:16777215,roughness:.44,metalness:0,sheen:.7,sheenRoughness:.38,sheenColor:new O(`#fff1dc`),clearcoat:.3,clearcoatRoughness:.28,side:2,envMapIntensity:.85});n.shadowSide=2;let r={uBase:{value:new O(e.base)},uMid:{value:new O(e.mid)},uEdge:{value:new O(e.edge)},uTip:{value:new O(e.tip)},uTrans:{value:new O(e.trans)},uVein:{value:t?.5:1}};return n.userData.uniforms=r,n.onBeforeCompile=e=>{Object.assign(e.uniforms,r),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vPetalUv;`).replace(`#include <uv_vertex>`,`#include <uv_vertex>
vPetalUv = uv;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>\n${lt}`).replace(`#include <color_fragment>`,`#include <color_fragment>
        {
          float u = vPetalUv.x * 2.0 - 1.0;
          float v = vPetalUv.y;
          float au = abs(u);
          vec2 vh = petalVeins(vPetalUv);
          vec3 c = mix(uBase, uMid, smoothstep(0.15, 0.85, v));
          // blush creeping in from the margins, strongest on the upper half
          float blush = smoothstep(0.4, 1.0, au) * smoothstep(0.1, 0.85, v);
          blush *= 0.75 + 0.5 * vnoise(vPetalUv * vec2(3.0, 5.0));
          c = mix(c, uEdge, blush * 0.5);
          // rose rim along the whole edge, widening toward the tip
          float rimW = mix(0.95, 0.86, smoothstep(0.5, 1.0, v));
          c = mix(c, uTip, smoothstep(rimW, 1.0, au) * smoothstep(0.3, 0.9, v) * 0.55);
          // magenta tip that bleeds down the centre line
          float tip = smoothstep(0.84, 0.995, v) * (1.0 - 0.55 * smoothstep(0.2, 0.85, au));
          c = mix(c, uTip, tip * 0.9);
          // veins: slightly darker and pinker than the blade
          c *= 1.0 - 0.08 * vh.x;
          c = mix(c, uEdge, vh.x * 0.12);
          // occlusion where the petal meets the receptacle
          c *= mix(0.8, 1.0, smoothstep(0.0, 0.3, v));
          diffuseColor.rgb *= c;
        }`).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
        {
          // bump from the vein relief (derivative bump, as in three's bumpmap)
          float hb = petalVeins(vPetalUv).y * 0.0008;
          vec3 dpx = dFdx(-vViewPosition);
          vec3 dpy = dFdy(-vViewPosition);
          float hx = dFdx(hb);
          float hy = dFdy(hb);
          vec3 r1 = cross(dpy, normal);
          vec3 r2 = cross(normal, dpx);
          float det = dot(dpx, r1);
          vec3 grad = sign(det) * (hx * r1 + hy * r2);
          normal = normalize(abs(det) * normal - grad);
        }`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
        {
          // soft pink halo where the petal turns away from the viewer
          float fres = pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 3.0);
          totalEmissiveRadiance += uTrans * uEdge * fres * 0.1;
        }`).replace(`#include <lights_fragment_end>`,`#include <lights_fragment_end>
        #if NUM_DIR_LIGHTS > 0
        {
          // backlit translucency from the low sun, warmer and thicker toward the base
          vec3 L = directionalLights[ 0 ].direction;
          vec3 V = geometryViewDir;
          float back = pow(clamp(dot(-V, L), 0.0, 1.0), 2.0);
          float thru = clamp(-dot(normal, L), 0.0, 1.0);
          float thin = mix(0.55, 1.0, smoothstep(0.1, 0.8, vPetalUv.y));
          vec3 trans = uTrans * diffuseColor.rgb * directionalLights[ 0 ].color;
          reflectedLight.directDiffuse += trans * (0.45 * thru + 0.55 * back) * thin;
        }
        #endif`)},n.customProgramCacheKey=()=>t?`petal-sepal`:`petal`,n}var dt={base:`#fffdf8`,mid:`#fcf7ee`,edge:`#f3e8d6`,tip:`#e6d2b0`,trans:`#fff4e0`},ft={base:`#a3ae7c`,mid:`#8d9a66`,edge:`#76844f`,tip:`#5f6c3c`,trans:`#c3cc9a`};function pt({envMap:e}={}){let t=new v;t.name=`flower`;let n=it(20261009),r=ut(dt),i=ut(ft,{sepal:!0});e&&(r.envMap=e,i.envMap=e);let a=[[0,-.035],[.035,-.032],[.07,-.015],[.098,.012],[.112,.042],[.106,.068],[.085,.085],[.05,.094],[0,.097]].map(([e,t])=>new d(e,t)),o=new f(a,40),s=new A({color:`#6f7d48`,roughness:.42,sheen:.5,sheenColor:new O(`#dfe6bf`),clearcoat:.3,clearcoatRoughness:.3,envMapIntensity:.7});e&&(s.envMap=e);let c=new N(o,s);c.castShadow=!0,c.receiveShadow=!0,t.add(c);let l=[];for(let e of rt)for(let a=0;a<e.count;a++){let o=e.phase+a/e.count*Math.PI*2+(n()-.5)*.08,s=new v;s.rotation.y=o,s.position.set(Math.sin(o)*e.r0,e.y0,Math.cos(o)*e.r0);let c=new v;s.add(c);let u=ct(),d=new N(u,e.sepal?i:r);d.castShadow=!0,d.receiveShadow=!0,c.add(d),t.add(s);let f={len:1+(n()-.5)*.08,wid:1+(n()-.5)*.1,tilt:(n()-.5)*.06,bend:(n()-.5)*.08};l.push({ring:e,index:a,az:o,pivot:s,tiltGroup:c,mesh:d,geo:u,jitter:f,spine:new Float32Array(140),open:-1,stagger:a*3%e.count/e.count})}let u={len:0,wid:0,tilt:0,bend:0,pow:0,cup:0,point:0};function p(e,t){if(Math.abs(e.open-t)<1e-5)return!1;e.open=t;let{closed:n,open:r}=e.ring,i=Math.min(Math.max(t,0),1);u.len=e.ring.len*e.jitter.len*at(n.len??1,1,i),u.point=at(n.point??0,0,i),u.wid=e.ring.wid*e.jitter.wid;let a=Math.cos(e.az),o=Math.max(0,a)**2*i,s=Math.max(0,-a)**1.5*i,c=t=>(e.ring.front?.[t]??0)*o+(e.ring.back?.[t]??0)*s;return u.len*=1+c(`len`),u.wid*=1+c(`wid`),u.bend=at(n.bend,r.bend,t)+e.jitter.bend+c(`bend`),u.pow=at(n.pow,r.pow,i),u.cup=at(n.cup,r.cup,i)+c(`cup`),u.tilt=at(n.tilt,r.tilt,t)+e.jitter.tilt*t+c(`tilt`),e.tiltGroup.rotation.x=u.tilt,st(u,e.geo.attributes.position.array,e.spine),e.geo.attributes.position.needsUpdate=!0,e.geo.computeVertexNormals(),e.geo.computeBoundingSphere(),!0}function m(e){let t=!1;for(let n of l)t=p(n,e(n))||t;return t}return m(()=>0),{group:t,petals:l,setOpen:m,petalMat:r,sepalMat:i,receptacle:c,SEG_U:nt,SEG_V:R}}function mt(e,{envMap:t}={}){let n=it(77),r=[];for(let t of e.petals){let i=!!t.ring.sepal,a=i?2:t.ring.name===`core`?4:12;for(let i=0;i<a;i++){let i=n()<.5?0:e.SEG_U,a=Math.round((.3+n()*.62)*e.SEG_V);r.push({p:t,i,j:a,side:n()<.5?1:-1,r:.0035+n()*.0042})}let o=i?1:t.ring.name===`core`?3:8;for(let i=0;i<o;i++){let i=Math.round((.15+n()*.7)*e.SEG_U),a=Math.round((.25+n()*.6)*e.SEG_V);r.push({p:t,i,j:a,side:n()<.5?1:-1,r:.0022+n()*.0026})}i||r.push({p:t,i:e.SEG_U/2,j:e.SEG_V,side:1,r:.0075+n()*.0035,tip:!0})}let i=new ee(1,2),a=new A({color:`#fdf9f6`,roughness:.03,metalness:0,transparent:!0,opacity:.6,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:2.2,depthWrite:!1});t&&(a.envMap=t);let o=new x(i,a,r.length);o.instanceMatrix.setUsage(s),o.frustumCulled=!1,o.renderOrder=2;let c=new T,l=new b,d=new b,f=new u,p=new b,m=new ne,h=new b(0,1,0);function g(t=1){for(let n=0;n<r.length;n++){let i=r[n],{mesh:a,geo:s}=i.p,u=i.j*(e.SEG_U+1)+i.i;l.fromBufferAttribute(s.attributes.position,u),d.fromBufferAttribute(s.attributes.normal,u),l.applyMatrix4(a.matrixWorld),m.getNormalMatrix(a.matrixWorld),d.applyMatrix3(m).normalize().multiplyScalar(i.side);let g=i.r*t;i.tip?(l.y-=g*.55,p.set(g,g*1.15,g),f.identity()):(l.addScaledVector(d,g*.45),p.set(g,g*.7,g),f.setFromUnitVectors(h,d)),c.compose(l,f,p),o.setMatrixAt(n,c)}o.instanceMatrix.needsUpdate=!0}return{mesh:o,update:g}}var ht={rx:.66,rz:.5,height:.13,y:-.035};function gt(e,t,n){let r=Math.sin(e*127.1+t*311.7+n*74.7)*43758.5453;return r-Math.floor(r)}function _t(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=Math.floor(n),o=e-r,s=t-i,c=n-a,l=o*o*(3-2*o),u=s*s*(3-2*s),d=c*c*(3-2*c),f=0;for(let e=0;e<=1;e++)for(let t=0;t<=1;t++)for(let n=0;n<=1;n++){let o=(n?l:1-l)*(t?u:1-u)*(e?d:1-d);f+=o*gt(r+n,i+t,a+e)}return f}function vt({envMap:e,clipPlanes:n}){let r=new v;r.name=`stone`;let i=new ee(1,14);i.deleteAttribute(`normal`),i.deleteAttribute(`uv`);let a=t(i),o=a.attributes.position,s=new b;for(let e=0;e<o.count;e++){s.fromBufferAttribute(o,e).normalize();let t=_t(s.x*3.1+7,s.y*3.1,s.z*3.1)*.6+_t(s.x*9+1,s.y*9,s.z*9)*.4,n=1+(t-.5)*.22,r=s.y>0?s.y**.75:s.y;o.setXYZ(e,s.x*ht.rx*n,r*ht.height*(.85+t*.3),s.z*ht.rz*n)}a.computeVertexNormals();let c=new ae({color:`#35302b`,roughness:.3,metalness:0,envMapIntensity:1.1,clippingPlanes:n});e&&(c.envMap=e);let l=new N(a,c);l.position.y=ht.y,l.receiveShadow=!0,l.castShadow=!0,r.add(l);let d=2600,f=new ee(1,1),p=new ae({color:`#ffffff`,roughness:.28,metalness:0,envMapIntensity:1.25,clippingPlanes:n});e&&(p.envMap=e);let m=new x(f,p,d);m.receiveShadow=!0,m.castShadow=!0;let h=new k,_=new T,y=new u,S=new g,C=new b,w=new b,E=new O,D=[`#29241f`,`#433b33`,`#5a5047`,`#38302a`,`#706457`,`#211c18`,`#51463c`];l.updateMatrixWorld(!0);let te=3,A=()=>(te=te*16807%2147483647,(te-1)/2147483646),j=0;for(let e=0;j<d&&e<d*4;e++){let e=A()*Math.PI*2,t=Math.sqrt(A())*1.02,n=Math.cos(e)*ht.rx*t,r=Math.sin(e)*ht.rz*t;h.set(new b(n,1,r),new b(0,-1,0));let i=h.intersectObject(l,!1)[0];if(!i||(w.copy(i.point),w.y<-.01))continue;let a=.0045+A()**3*.015;C.set(a*(.8+A()*.5),a*(.35+A()*.3),a*(.8+A()*.5)),S.set(A()*.6,A()*Math.PI,A()*.6),y.setFromEuler(S),_.compose(w,y,C),m.setMatrixAt(j,_),E.set(D[Math.floor(A()*D.length)]),m.setColorAt(j,E),j++}return m.count=j,r.add(m),{group:r,dome:l,grains:m}}var yt=[[`outer`,7],[`outer`,1],[`middle`,4],[`outer`,2],[`inner`,0],[`outer`,6],[`middle`,1],[`inner`,4]],bt=7.8,xt=3.4,St=1.2,Ct=1.5,wt=2.4,Tt=.0058,Et=3.6;function Dt(e){let t=Math.sin(e*91.17+4.3)*43758.5453;return t-Math.floor(t)}function Ot(e){return bt+e*xt+(Dt(e)-.5)*St}function kt(e,{envMap:t}={}){let n=yt.map(([t,n])=>e.petals.find(e=>e.ring.name===t&&e.index===n)).filter(Boolean),r=e.SEG_V*(e.SEG_U+1)+e.SEG_U/2,i=new l(1,20,14),a=new A({color:`#fdfaf7`,roughness:.02,metalness:0,transparent:!0,opacity:.68,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:2.4,depthWrite:!1});t&&(a.envMap=t);let o=new x(i,a,2);o.instanceMatrix.setUsage(s),o.frustumCulled=!1,o.renderOrder=2;let c=Array.from({length:4},()=>new S),d=new T,f=new b,p=new b,m=new u;function h(e,t){let i=n[(e*3+Math.floor(Dt(e+17)*2))%n.length];return t.fromBufferAttribute(i.geo.attributes.position,r).applyMatrix4(i.mesh.matrixWorld)}function g(e){let t=Math.floor((e-bt)/xt)+1,n=0;for(let r=t;r>=Math.max(0,t-3);r--){let t=Ot(r);if(e<t)continue;h(r,f);let i=Math.sqrt(2*Math.max(f.y,.05)/wt),a=t+Ct,s=a+i;if(e<s&&n<2){if(e<a){let n=(e-t)/Ct,r=Tt*(.35+.65*n*n);f.y-=.006+r*(.6+.5*n),p.set(r,r*(1.05+.2*n),r)}else{let t=e-a,n=wt*t;f.y-=.01238+.5*wt*t*t;let r=1.15+Math.min(n*.35,.55);p.set(Tt*.88,Tt*r,Tt*.88)}d.compose(f,m,p),o.setMatrixAt(n++,d)}else if(e>=s&&e-s<3.6){let e=r%4;c[e].set(f.x,f.z,s,1)}}for(let e=n;e<2;e++)d.makeScale(0,0,0),o.setMatrixAt(e,d);for(let t of c)(e-t.z>=3.6||e<t.z)&&(t.w=0);o.instanceMatrix.needsUpdate=!0}return{mesh:o,impacts:c,update:g}}var At=`
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`,jt=`
uniform sampler2D tSky;
uniform sampler2D tRefl;
uniform vec2 uRes;
uniform float uHorizonNdc;
uniform float uSkyScale;
uniform mat4 uInvProj;
uniform mat4 uCamWorld;
uniform mat4 uViewProj;
uniform mat4 uReflMat;
uniform float uTime;
uniform float uLand;
uniform vec3 uWaterDeep;
uniform vec3 uWaterTint;
uniform vec3 uReflTint;
uniform vec2 uStone;
uniform float uRipple;
uniform vec4 uDrips[DRIP_SLOTS]; // x, z, impact time, strength
uniform vec4 uSplash; // story drop/bottle: x, z, age (s), strength
uniform vec4 uSkyTint; // story mist in the clouds: rgb multiplier, amount
varying vec2 vNdc;

float texRowFor(float ndcY) {
  float py = (1.0 - (ndcY * 0.5 + 0.5)) * uRes.y;
  float hy = (1.0 - (uHorizonNdc * 0.5 + 0.5)) * uRes.y;
  return (py - hy) / uSkyScale + 540.0;
}

vec3 skyAt(vec2 ndc) {
  float px = (ndc.x * 0.5 + 0.5) * uRes.x;
  float tx = (px - uRes.x * 0.5) / uSkyScale + 960.0;
  float ty = clamp(texRowFor(ndc.y), 0.5, 604.5);
  vec3 c = texture2D(tSky, vec2(tx / 1920.0, 1.0 - ty / 605.0)).rgb;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, lum * vec3(1.13, 0.97, 0.78), 0.78);
  if (uSkyTint.w > 0.0) {
    // the essence soaks into the clouds in slow, uneven drifts
    float above = smoothstep(548.0, 360.0, ty);
    float n = 0.6 + 0.4 * sin(tx * 0.0061 + uTime * 0.05) * sin(ty * 0.013 - tx * 0.0023 + 1.7);
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(c, c * uSkyTint.rgb, uSkyTint.w * above * n * smoothstep(0.35, 0.8, l));
  }
  return c;
}

// returns (dh/dx, dh/dz)
vec2 waterSlope(vec2 p) {
  vec2 slope = vec2(0.0);
  vec2 q = p / uStone;
  float e = length(q);
  float r = length(p) + 1e-4;
  vec2 dir = p / r;
  float outside = smoothstep(0.92, 1.12, e);
  float decay = exp(-max(r - 0.7, 0.0) * 0.32);
  float d = 0.0;
  d += 0.02 * cos(r * 34.0 - uTime * 1.7);
  d += 0.009 * cos(r * 57.0 - uTime * 2.5 + 1.3);
  d *= outside * decay * uRipple;
  float dt = uTime - uLand;
  if (dt > 0.0) {
    float c = 0.62 + dt * 0.5;
    float g = exp(-pow((r - c) / 0.28, 2.0));
    d += 0.09 * g * cos((r - c) * 40.0) * exp(-dt * 0.3) * outside;
  }
  slope += dir * d;
  // faint rings where a drip from the petals hits the water
  for (int i = 0; i < DRIP_SLOTS; i++) {
    vec4 dp = uDrips[i];
    float age = uTime - dp.z;
    if (dp.w <= 0.0 || age < 0.0 || age > RIPPLE_LIFE) continue;
    vec2 o = p - dp.xy;
    float rr = length(o) + 1e-4;
    float c = 0.008 + age * 0.26;
    float env = exp(-pow((rr - c) / (0.018 + age * 0.03), 2.0));
    float fade = exp(-age * 0.95) * (1.0 - smoothstep(RIPPLE_LIFE - 0.8, RIPPLE_LIFE, age));
    slope += (o / rr) * dp.w * 0.1 * env * fade * sin((rr - c) * 110.0) / (1.0 + rr * 4.0);
  }
  // one big impact (the story's water drop or the falling bottle): a short train of rings
  if (uSplash.w > 0.0) {
    vec2 o = p - uSplash.xy;
    float rr = length(o) + 1e-4;
    float age = uSplash.z;
    for (int j = 0; j < 3; j++) {
      float c = age * (0.42 - float(j) * 0.11);
      float env = exp(-pow((rr - c) / (0.03 + age * 0.05), 2.0));
      slope += (o / rr) * uSplash.w * 0.14 * env * exp(-age * 0.4) * sin((rr - c) * 75.0 - uTime * 2.0) / (1.0 + rr * 2.0);
    }
  }
  // wind micro-waves, mostly across z, so reflections smear vertically
  slope.y += 0.010 * sin(p.y * 21.0 + uTime * 1.05 + sin(p.x * 2.7) * 1.6);
  slope.y += 0.006 * sin(p.y * 47.0 - uTime * 1.6 + p.x * 4.0);
  slope.x += 0.004 * sin(p.x * 15.0 + p.y * 7.0 + uTime * 0.7);
  return slope;
}

void main() {
  vec2 ndc = vNdc;
  vec4 vp = uInvProj * vec4(ndc, 1.0, 1.0);
  vp /= vp.w;
  vec3 dir = normalize((uCamWorld * vec4(vp.xyz, 0.0)).xyz);
  vec3 ro = cameraPosition;

  vec3 col;
  float row = texRowFor(ndc.y);
  if (dir.y > -1e-4) {
    col = skyAt(ndc);
  } else {
    float t = -ro.y / dir.y;
    vec3 P = ro + dir * t;
    vec2 s = waterSlope(P.xz);
    // flatten micro-detail with distance to avoid shimmering at the horizon
    s *= mix(1.0, 0.35, smoothstep(6.0, 30.0, t));
    vec3 n = normalize(vec3(-s.x, 1.0, -s.y));
    vec3 r = reflect(dir, n);
    r.y = max(r.y, 0.0015);
    vec4 qc = uViewProj * vec4(r, 0.0);
    vec2 ndcR = qc.xy / max(qc.w, 1e-4);
    vec3 sky = skyAt(ndcR);

    float cosT = clamp(dot(n, -dir), 0.0, 1.0);
    float F = 0.58 + 0.42 * pow(1.0 - cosT, 3.0);
    col = mix(uWaterDeep, sky * uWaterTint, F);

    // planar reflection of the flower and stone
    vec4 rp = uReflMat * vec4(P, 1.0);
    vec2 ruv = rp.xy / rp.w + vec2(s.x * 0.5, s.y * 1.2);
    vec4 refl = vec4(0.0);
    refl += texture2D(tRefl, ruv + vec2(0.0, -0.011)) * 0.2;
    refl += texture2D(tRefl, ruv + vec2(0.0, -0.005)) * 0.2;
    refl += texture2D(tRefl, ruv) * 0.2;
    refl += texture2D(tRefl, ruv + vec2(0.0, 0.005)) * 0.2;
    refl += texture2D(tRefl, ruv + vec2(0.0, 0.011)) * 0.2;
    col = mix(col, refl.rgb / max(refl.a, 1e-3) * uReflTint, clamp(refl.a, 0.0, 1.0) * 0.76);

    // thin bright meniscus where the water touches the stone
    float e = length(P.xz / uStone);
    col += vec3(0.05, 0.035, 0.04) * exp(-pow((e - 1.0) / 0.035, 2.0));
    col *= 1.0 - 0.18 * exp(-pow((e - 1.05) / 0.12, 2.0));

    // far water fades into the plate's own haze band
    float far = 1.0 - smoothstep(546.0, 600.0, row);
    col = mix(col, skyAt(ndc), far);
  }

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;function Mt({skyTexture:e,reflTexture:t,drips:n}){let r={tSky:{value:e},tRefl:{value:t},uRes:{value:new d(1,1)},uHorizonNdc:{value:0},uSkyScale:{value:1},uInvProj:{value:new T},uCamWorld:{value:new T},uViewProj:{value:new T},uReflMat:{value:new T},uTime:{value:0},uLand:{value:1e6},uWaterDeep:{value:new O(`#4b2f1e`)},uWaterTint:{value:new O(`#f2e2cf`)},uReflTint:{value:new O(`#dcc4a8`)},uStone:{value:new d(ht.rx,ht.rz)},uRipple:{value:1},uDrips:{value:n},uSplash:{value:new S},uSkyTint:{value:new S(1,1,1,0)}},i=new ue({uniforms:r,vertexShader:At,fragmentShader:jt,depthWrite:!1,defines:{DRIP_SLOTS:4,RIPPLE_LIFE:Et.toFixed(2)},depthTest:!1,toneMapped:!1}),a=new M;a.setAttribute(`position`,new w(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));let o=new N(a,i);o.frustumCulled=!1,o.renderOrder=-1e3;let s=new T,c=new b,l=new S;function u(e,t,n,i){r.uRes.value.set(t,n),r.uSkyScale.value=Math.max(t/1920,n/1080),r.uInvProj.value.copy(e.projectionMatrixInverse),r.uCamWorld.value.copy(e.matrixWorld),s.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),r.uViewProj.value.copy(s),r.uReflMat.value.copy(i),e.getWorldDirection(c),c.y=0,c.normalize(),l.set(c.x,0,c.z,0).applyMatrix4(s),r.uHorizonNdc.value=l.y/l.w}return{mesh:o,uniforms:r,update:u}}var Nt=1,Pt=new URLSearchParams(location.search),Ft=Pt.has(`t`)?parseFloat(Pt.get(`t`)):null,It=location.hash===`#bodega`,Lt=!It&&Ft===null&&!Pt.has(`p`)&&Pt.get(`entrada`)!==`0`,Rt=Lt,zt=Lt?tt({onStart(){Rt=!1,document.body.classList.add(`is-ready`)}}):null;zt&&document.documentElement.classList.add(`has-gate`);var Bt=Pt.get(`producto`)??`cafe`,Vt=Bt===`original`?null:Bt,Ht=Vt?`agua`:null,z=[{pr:1.5,prPhone:2.25,samples:4,refl:.5,trans:.5},{pr:1.25,prPhone:2,samples:2,refl:.4,trans:.4},{pr:1,prPhone:1.5,samples:0,refl:.33,trans:.33},{pr:.6,prPhone:.6,samples:0,refl:.25,trans:.25,bloom:!1}],Ut=()=>window.innerWidth<760,Wt=e=>Math.min(window.devicePixelRatio,Ut()?e.prPhone:e.pr),Gt=Pt.has(`calidad`)?Math.min(z.length-1,Math.max(0,parseInt(Pt.get(`calidad`),10)||0)):null,B=Gt??+!!Ut(),Kt=document.querySelector(`#scene`),V=new e({canvas:Kt,antialias:!Vt,powerPreference:`high-performance`});if(V.setPixelRatio(Wt(z[B])),V.transmissionResolutionScale=z[B].trans,Gt===null){let e=V.getContext(),t=e.getExtension(`WEBGL_debug_renderer_info`),n=String(e.getParameter(t?t.UNMASKED_RENDERER_WEBGL:e.RENDERER)||``);/swiftshader|llvmpipe|softpipe|software|basic render/i.test(n)&&(B=z.length-1,V.setPixelRatio(Wt(z[B])),V.transmissionResolutionScale=z[B].trans)}V.outputColorSpace=fe,V.toneMapping=7,V.toneMappingExposure=1.06,V.shadowMap.enabled=!0,V.shadowMap.type=Vt?3:1,V.localClippingEnabled=!0;var H=new a,U=new E(30,16/9,.05,400);function qt(){let e=new a,t=new ue({side:1,depthWrite:!1,uniforms:{uZenith:{value:new O(`#c9a27e`)},uHorizon:{value:new O(`#f1dcc2`)},uWater:{value:new O(`#7a5638`)},uSun:{value:new O(`#fff3df`)},uSunDir:{value:new b(-1,.32,-1.1).normalize()}},vertexShader:`varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`
      uniform vec3 uZenith, uHorizon, uWater, uSun, uSunDir; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        vec3 c = d.y > 0.0 ? mix(uHorizon, uZenith, pow(d.y, 0.6)) : mix(uHorizon, uWater, pow(-d.y, 0.4));
        float s = max(dot(d, uSunDir), 0.0);
        c += uSun * (pow(s, 24.0) * 1.6 + pow(s, 4.0) * 0.25);
        gl_FragColor = vec4(c, 1.0);
      }`});e.add(new N(new l(10,48,24),t));let r=new n(V),i=r.fromScene(e,.02);return r.dispose(),i.texture}var Jt=qt();function Yt(){let e=new n(V),t=new be,r=e.fromScene(t,.03);return t.dispose(),e.dispose(),r.texture}var Xt=Yt();async function Zt(){let e=await new xe().loadAsync(`./hdr/studio_small_09_1k.hdr`);e.mapping=303;let t=new n(V),r=t.fromEquirectangular(e);return e.dispose(),t.dispose(),r.texture}var Qt=new i(`#fbeedd`,`#7d5c45`,1.15),$t=new c(`#ffe3c4`,2.1);$t.position.set(-3.2,2,-2.6);var W=new c(`#fff2e2`,1.45);W.position.set(-1.6,3.4,2.4),W.castShadow=!0,W.shadow.mapSize.set(1024,1024),W.shadow.camera.left=-1.4,W.shadow.camera.right=1.4,W.shadow.camera.top=1.6,W.shadow.camera.bottom=-1,W.shadow.camera.near=.5,W.shadow.camera.far=9,W.shadow.bias=-4e-4,W.shadow.normalBias=.015,W.shadow.radius=4;var en=new c(`#f4dcc2`,.45);en.position.set(2.5,.6,2);for(let e of[Qt,$t,W,en])e.layers.enable(Nt),H.add(e);var tn=vt({envMap:Jt,clipPlanes:[new pe(new b(0,1,0),0)]});H.add(tn.group);var nn=pt({envMap:Jt}),rn=new v;rn.add(nn.group);var G,an=null;if(Vt){let{createProduct:e}=await _e(async()=>{let{createProduct:e}=await import(`./product-ByvAQyXQ.js`);return{createProduct:e}},__vite__mapDeps([0,1,2]),import.meta.url),t=await Zt();an=()=>e({variant:Vt,envMap:t}),G=await an()}else G=ve({envMap:Xt});rn.add(G.group),H.add(rn);var on=mt(nn,{envMap:Jt});H.add(on.mesh);var sn=kt(nn,{envMap:Jt});H.add(sn.mesh);var cn=ye({count:Ut()?72:140});H.add(cn.mesh);var ln=.088;for(let e of[tn.group,rn,on.mesh,sn.mesh])e.traverse(e=>e.layers.enable(Nt));var un=new p(2,2,{type:P}),K=new E;K.layers.set(Nt);var dn=new T,fn=new b,pn=new b,mn=new T;function hn(){U.updateMatrixWorld(),fn.setFromMatrixPosition(U.matrixWorld),mn.extractRotation(U.matrixWorld),pn.set(0,0,-1).applyMatrix4(mn).add(fn),K.position.set(fn.x,-fn.y,fn.z),K.up.set(0,1,0).applyMatrix4(mn),K.up.y*=-1,K.lookAt(pn.x,-pn.y,pn.z),K.updateMatrixWorld(),K.projectionMatrix.copy(U.projectionMatrix),K.projectionMatrixInverse.copy(U.projectionMatrixInverse),dn.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),dn.multiply(K.projectionMatrix).multiply(K.matrixWorldInverse);let e=V.shadowMap.autoUpdate;V.shadowMap.autoUpdate=!1,V.setRenderTarget(un),V.setClearColor(0,0),V.clear(),V.render(H,K),V.setRenderTarget(null),V.setClearColor(0,1),V.shadowMap.autoUpdate=e}var gn=await new _().loadAsync(`./tex/sky.jpg`);gn.colorSpace=fe,gn.wrapS=D,gn.wrapT=D,gn.generateMipmaps=!1,gn.minFilter=C;var _n=Mt({skyTexture:gn,reflTexture:un.texture,drips:sn.impacts});H.add(_n.mesh);var q=null,vn=null,yn=null;Vt&&(q=new we(V,new p(2,2,{type:P,samples:z[B].samples})),vn=new Te(H,U),yn=new De(new d(2,2),.45,.25,1.5),q.addPass(vn),q.addPass(yn),q.addPass(new ke));var J={w:1,h:1,dist:4,height:.5,top:1.6};function bn(){let e=window.innerWidth,t=window.innerHeight;V.setPixelRatio(Wt(z[B])),V.setSize(e,t,!1);let n=e/t;U.aspect=n,J.dist=4*Math.max(1,(1.62/n)**.78),J.height=J.dist*.125,J.top=J.height+J.dist*Math.tan(oe.degToRad(U.fov/2)),U.updateProjectionMatrix();let r=V.getPixelRatio(),i=z[B].refl;un.setSize(Math.max(2,Math.round(e*r*i)),Math.max(2,Math.round(t*r*i))),J.w=Math.round(e*r),q&&(q.setPixelRatio(r),q.setSize(e,t)),J.h=Math.round(t*r),cn.uniforms.uPx.value=t*r/(2*Math.tan(oe.degToRad(U.fov/2))),Y?.resize(e,t,r),xn?.resize(e,t,r)}var Y=null,xn=null,Sn=null,Cn,wn=null;window.addEventListener(`resize`,bn),bn(),`scrollRestoration`in history&&(history.scrollRestoration=`manual`);var X={x:0,y:0,sx:0,sy:0};window.addEventListener(`pointermove`,e=>{X.x=e.clientX/window.innerWidth*2-1,X.y=e.clientY/window.innerHeight*2-1});var Z={fallStart:.35,fallDur:2.5,get land(){return this.fallStart+this.fallDur},openDur:3,hero:2.4,bloomEnd:4,flourishEnd:10.4,get heroAt(){return this.land+this.hero},get introEnd(){return this.land+this.flourishEnd}},Tn=e=>Math.min(1,Math.max(0,e)),En=(e,t=1.15)=>1+(t+1)*(e-1)**3+t*(e-1)**2,Dn=e=>e*e*(3-2*e),On=(e,t,n)=>Tn((n-e)/(t-e)),kn={outer:.88,middle:.66,inner:.56},An={outer:0,middle:.12,inner:.25};function jn(e,t,n){let r=t-Z.land,i=e.ring.name===`outer`?.07*Dn(Tn((t-(Z.fallStart+Z.fallDur*.72))/(Z.fallDur*.28))):0;if(e.ring.sepal)return i+.9*Dn(Tn((r-.05)/2.2));let a=kn[e.ring.name]??1,o=.12+e.ring.delay*.6+e.stagger*.18,s=Tn((r-o)/(Z.hero-.1-o)),c=s<=0?0:a*(1-(1-s)**3),l=Z.hero+(An[e.ring.name]??0)+e.stagger*.12,u=Tn((r-l)/(Z.bloomEnd-.1-l));u>0&&(c=a+(1-a)*En(u)),c=i+(1-i)*c;let d=Tn((n-Z.land-Z.hero)/1.5);return c+=d*.018*Math.sin(n*.9+e.az*2+e.index),c}function Mn(e){let t=Tn((e-Z.land-.5)/(Z.hero-.6));return t<=0?0:1-(1-t)**3}var Nn=.55;function Pn(e){return Nn+.44999999999999996*Dn(On(Z.hero+.25,Z.bloomEnd,e-Z.land))}var Fn=.22,In=Ht===`agua`;function Ln(e){if(!G.setCapOff)return;let t=e-Z.land,n=(.5*Dn(On(4.2,5.7,t))+.5*Dn(On(6.7,7.35,t)))*(1-(In?0:Dn(On(9.8,Z.flourishEnd,t))));G.inner.position.y+=Fn*n+.006*Math.sin((t-5.7)*2.4)*n,G.inner.rotation.y=Math.PI*2*Dn(On(4.6,7.1,t)),G.setCapOff(On(6.45,7.45,t)*(1-On(9.95,10.4,t))),cn.update(t-7.25,G.mouth)}function Rn(e){let t=Tn((e-Z.fallStart)/Z.fallDur),n=.55*t+.45*t*t,r=J.top+.04,i=r+(ln-r)*n,a=1,o=1,s=e-Z.land;if(s>0){i=ln;let e=Math.exp(-s*6.5)*Math.sin(s*22);o=1-.06*e,a=1+.03*e}let c=(1-t)*(1-t);rn.position.set(Math.sin(t*5.2)*.05*c,i,Math.cos(t*4.1)*.03*c),rn.rotation.set(Math.sin(t*6+.4)*.12*c,-.9+.9*Dn(t),Math.sin(t*5.1)*.1*c),rn.scale.set(a,o,a)}if(Ht){let{createStory:e}=await _e(async()=>{let{createStory:e}=await import(`./story-DEYPk3Nw.js`);return{createStory:e}},__vite__mapDeps([3,1,4,5]),import.meta.url);if(Y=await e(Ht,{renderer:V,composer:q,scene:H,camera:U,view:J,T:Z,flower:nn,flowerRoot:rn,bottle:G,backdrop:_n,envMap:Jt,studioEnv:Xt,makeProduct:an,isMobile:Ut,hover:In?Fn:0,samples:z[B].samples,lowGpu:B===z.length-1,lead:G.setCapOff?2.6:0}),Y.showroom){let{createShowroom:e}=await _e(async()=>{let{createShowroom:e}=await import(`./showroom-jyd42i1t.js`);return{createShowroom:e}},__vite__mapDeps([6,1,7,8]),import.meta.url);xn=e({...Y.showroom,isMobile:Ut})}if(Y.lead){let e=e=>Y.lead*Tn((e-Z.hero)/(Z.flourishEnd-Z.hero)),t=[...document.querySelectorAll(`.nav__links a`)],n=document.querySelector(`.nav__toggle`),r=n.closest(`nav`),i=()=>n.setAttribute(`aria-expanded`,`false`);n.addEventListener(`click`,()=>n.setAttribute(`aria-expanded`,String(n.getAttribute(`aria-expanded`)!==`true`))),document.addEventListener(`pointerdown`,e=>{r.contains(e.target)||i()}),r.addEventListener(`focusout`,e=>{r.contains(e.relatedTarget)||i()}),r.addEventListener(`keydown`,e=>{e.key===`Escape`&&(i(),n.focus())});let a=e(Me.ritual.from),o=Y.lead+(xn?.onAt??Y.N),s=[0,e((Me.ritual.from+Me.ritual.to)/2),o];t.forEach((e,t)=>e.addEventListener(`click`,e=>{e.preventDefault(),n.getAttribute(`aria-expanded`)===`true`&&n.focus(),i(),Y.goTo(s[t])})),wn=e=>Y.goTo(s[e]);let c=-1;Cn=()=>{let e=(xn?xn.on:Y.q>=o-1e-6)?2:+(Y.q>=a);e!==c&&(t[c]?.removeAttribute(`aria-current`),t[e].setAttribute(`aria-current`,`location`),c=e)},Sn=ze({end:o,marks:[{q:0,label:`La flor`},{q:e(Me.ritual.from),label:`El reposo`},{q:e(Me.mist.from),label:`El aroma`},{q:Y.lead+.15,label:`La caída`},{q:Y.lead+1.6,label:`La bodega`}]})}bn()}function zn(){let e=z[B];if(V.setPixelRatio(Wt(e)),V.transmissionResolutionScale=e.trans,Q.frames=0,q)for(let t of[q.renderTarget1,q.renderTarget2])t.samples=e.samples,t.dispose();Y?.setSamples(e.samples),bn()}var Q={acc:0,n:0,slow:0,frames:0};function Bn(e){if(Gt!==null||$!==null||B>=z.length-1||!(e>0)||Rt||++Q.frames<=24||(Q.acc+=e,Q.n++,Q.acc<1))return;let t=Q.acc/Q.n;Q.acc=0,Q.n=0,Q.slow=t>1/45?Q.slow+1:0,Q.slow>=2&&(Q.slow=0,B++,zn())}async function Vn(){let e=[],t=t=>t.traverse(t=>{t.visible||=(e.push(t),!0)});t(H);let n=[];V.setRenderTarget(q?q.renderTarget1:null),n.push(V.compileAsync(H,U)),V.setRenderTarget(null),Y&&n.push(...Y.precompile(t));try{await Promise.all(n)}catch(e){console.warn(`precompile`,e)}finally{for(let t of e)t.visible=!1}}await Vn();var Hn=0,Un=0,Wn=0,$=Ft,Gn=new re;Gn.connect(document);var Kn={pos:new b,look:new b},qn=-1,Jn=-1,Yn=0;function Xn(){Gn.update();let e=Gn.getDelta();Bn(e),$===null&&!Rt&&(Hn+=Math.min(Math.max(e,0),.1));let t=$===null?Hn:$,n=t;Y?.lead&&$===null?(Hn>=Z.heroAt&&Y.unlock(),Y.scroll(e),Hn>=Z.heroAt&&(n=Z.heroAt+Y.lead01*(Z.introEnd-Z.heroAt))):Y&&(($!==null||Hn>Z.introEnd)&&Y.unlock(),Y.scroll(e)),$===null&&n-Z.land>6.45&&n-Z.land<10.4&&Un++,$===null&&cn.mesh.visible&&Wn++,Yn=n,Zn.update(n,Z),Qn.update(n,Z),$n.update(n,Z),er.update(n,Z),Rn(n),G.setReveal(Mn(n),Pn(n)),Ln(n),(t!==Jn||n!==qn)&&(nn.setOpen(e=>jn(e,n,t)),Jn=t,qn=n),X.sx+=(X.x-X.sx)*.04,X.sy+=(X.y-X.sy)*.04;let r=$===null?X.sx:0,i=$===null?X.sy:0;Kn.pos.set(r*.14*(J.dist/4),J.height-i*.04,J.dist),Kn.look.set(r*.04,J.height-i*.04,0),xn?.update(t,e,Y.p,B>=2),Cn?.(),Sn?.update(Y.q,t>=Z.heroAt-.5),Y?.update(t,Kn),xn?.post(),U.position.copy(Kn.pos),U.lookAt(Kn.look),U.updateMatrixWorld(),H.updateMatrixWorld(),on.update(1),sn.update(t),_n.uniforms.uTime.value=t,_n.uniforms.uLand.value=Z.land;let a=!Y||Y.prepare();if(a&&hn(),_n.update(U,J.w,J.h,dn),q){vn.enabled=a,yn.enabled=z[B].bloom!==!1;let e=Y?.glow??0;yn.threshold=1.5-.3*e,yn.strength=.45+.05*e,yn.radius=.25+.15*e,q.render()}else V.render(H,U)}var Zn=je(),Qn=Pe(),$n=Fe(),er=Ie();V.setAnimationLoop(Xn),It&&wn&&(Hn=Z.heroAt,wn(2)),zt?zt.ready():requestAnimationFrame(()=>{document.body.classList.add(`is-ready`)}),window.__sobremesa={setTime(e){$=e},play(){$=null,Hn=0},seek(e){$=null,Hn=e},T:Z,get tier(){return B},get clock(){return Hn},get timeline(){return Yn},get capOffFrames(){return Un},get steamFrames(){return Wn},pace:Q,info:V.info,get story(){return Y},get showroom(){return xn}};