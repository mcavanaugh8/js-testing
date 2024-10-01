let str = `L.G.13.a.4.i Produce (form) complete sentences. ;; L.G.13.a.4.ii Recognize and correct inappropriate sentence fragments. ;; L.G.13.a.4.iii Recognize and correct inappropriate run-ons. ;; L.G.12.a.4.iii Use subject-verb agreement. ;; L.G.12.a.4.i Ensure subject-verb agreement. 

W.TTP.4.a.4.i Write narratives to develop real or imagined experiences or events. ;; W.PDW.1.a.4.i Produce writing that is organized and developed to match the task, purpose, and audience. 

W.TTP.4.a.4.i Write narratives to develop real or imagined experiences or events. ;; SL.CC.1.4.ii Engage effectively in teacher-led discussions with diverse partners on grade 4 topics. 

W.TTP.4.a.4.i Write narratives to develop real or imagined experiences or events. ;; W.TTP.4.b.4.i Write a scene that includes a setting. ;; W.TTP.4.b.4.ii Introduce a narrator or characters. ;; W.TTP.4.b.4.iii Engage and orient the reader by creating a scene or situation that introduces a narrator or characters. ;; W.RBPK.3.f.4.i Take notes on sources and categorize information. ;; W.RBPK.3.h.4.i Paraphrase information in notes and finished work. 

W.PDW.1.a.4.i Produce writing that is organized and developed to match the task, purpose, and audience. ;; W.PDW.1.a.4.iv Plan a first draft by identifying a purpose and audience. ;; W.PDW.1.a.4.iv Plan a first draft by identifying a purpose and audience. 

L.G.13.a.4.i Produce (form) complete sentences. ;; L.G.12.a.4.iii Use subject-verb agreement. ;; L.G.13.a.4.ii Recognize and correct inappropriate sentence fragments. ;; L.G.13.a.4.iii Recognize and correct inappropriate run-ons. 

W.RBPK.3.f.4.i Take notes on sources and categorize information. ;; SL.CC.3.4.i Listen actively. 

SL.CC.12.4.ii Paraphrase portions of information presented in diverse ways (visually, quantitatively, orally). ;; SL.CC.3.4.i Listen actively. 

SL.CC.1.4.ii Engage effectively in teacher-led discussions with diverse partners on grade 4 topics. ;; SL.CC.1.4.xii Express ideas clearly in collaborative discussions. ;; SL.CC.8.4.v Make comments that contribute to the discussion. ;; W.RBPK.3.f.4.i Take notes on sources and categorize information. ;; W.RBPK.3.h.4.i Paraphrase information in notes and finished work. ;; W.TTP.4.a.4.i Write narratives to develop real or imagined experiences or events 

SL.CC.3.4.i Listen actively. ;; SL.CC.8.4.v Make comments that contribute to the discussion. 

L.G.13.a.4.i Produce (form) complete sentences. ;; L.G.12.a.4.iii Use subject-verb agreement. ;; L.G.13.a.4.ii Recognize and correct inappropriate sentence fragments. ;; L.G.13.a.4.iii Recognize and correct inappropriate run-ons. ;; W.RBPK.3.f.4.i Take notes on sources and categorize information. ;; SL.CC.3.4.i Listen actively. ;; W.TTP.4.a.4.i Write narratives to develop real or imagined experiences or events. 

W.PDW.2.c.4.ii Edit writing according to standard English conventions. ;; SL.CC.1.4.ii Engage effectively in teacher-led discussions with diverse partners on grade 4 topics. ;; SL.CC.2.4.i Follow agreed-upon rules for discussions. ;; SL.CC.3.4.i Listen actively. ;; SL.CC.1.4.xii Express ideas clearly in collaborative discussions. ;; SL.CC.5.4.i Work respectfully with others. ;; SL.CC.8.4.v Make comments that contribute to the discussion. ;; SL.CC.8.4.ii Respond to specific questions to clarify or follow up on information. ;; SL.CC.8.4.iv Express meaningful responses to questions posed by others. ;; L.VAU.4.b.4.viii Use grade appropriate words and phrases that are basic to a particular topic being discussed. 

SL.CC.1.4.ii Engage effectively in teacher-led discussions with diverse partners on grade 4 topics. ;; SL.CC.2.4.i Follow agreed-upon rules for discussions. ;; SL.CC.1.4.xii Express ideas clearly in collaborative discussions. ;; SL.CC.5.4.i Work respectfully with others. ;; SL.CC.8.4.v Make comments that contribute to the discussion. ;; SL.CC.8.4.ii Respond to specific questions to clarify or follow up on information. ;; SL.CC.8.4.iv Express meaningful responses to questions posed by others. ;; L.VAU.4.b.4.viii Use grade appropriate words and phrases that are basic to a particular topic being discussed. 

SL.CC.2.4.i Follow agreed-upon rules for discussions. ;; SL.CC.1.4.xii Express ideas clearly in collaborative discussions. ;; SL.CC.5.4.i Work respectfully with others. ;; SL.CC.8.4.v Make comments that contribute to the discussion. ;; SL.CC.8.4.ii Respond to specific questions to clarify or follow up on information. ;; SL.CC.8.4.iv Express meaningful responses to questions posed by others. 

L.VAU.4.b.4.viii Use grade appropriate words and phrases that are basic to a particular topic being discussed. ;; SL.CC.8.4.ii Respond to specific questions to clarify or follow up on information. ;; SL.CC.8.4.iv Express meaningful responses to questions posed by others. ;; SL.CC.3.4.i Listen actively. ;; SL.CC.2.4.i Follow agreed-upon rules for discussions. ;; SL.CC.5.4.i Work respectfully with others. 

SL.CC.1.4.ii Engage effectively in teacher-led discussions with diverse partners on grade 4 topics. ;; SL.CC.2.4.i Follow agreed-upon rules for discussions. ;; SL.CC.1.4.xii Express ideas clearly in collaborative discussions. ;; SL.CC.5.4.i Work respectfully with others. ;; SL.CC.8.4.ii Respond to specific questions to clarify or follow up on information. ;; SL.CC.8.4.iv Express meaningful responses to questions posed by others. ;; W.TTP.4.a.4.i Write narratives to develop real or imagined experiences or events. 

 `

console.log(str.match(/(^)(RL|RI|L|W|SL|RF)(\.)*([A-Z]{1,4})*(\.)*(\d)*(\.)*([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*/).length)

/***
 * 
 * (RL|RI|L|W|SL|RF)(\.)([A-Z]{1,4})(\.)(\d\d*)(\.)([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*[^\s]+
 */